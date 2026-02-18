import PocketBase from 'pocketbase';
import fs from 'fs';

const pb = new PocketBase(process.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090');
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || process.env.POCKETBASE_ADMIN_PASSWORD;

async function setup() {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        'Missing admin credentials. Set PB_ADMIN_EMAIL/PB_ADMIN_PASSWORD or POCKETBASE_ADMIN_EMAIL/POCKETBASE_ADMIN_PASSWORD.'
      );
    }

    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated');

    const schema = JSON.parse(fs.readFileSync('./schema.json', 'utf8'));
    let existing = await pb.collections.getFullList();
    let existingNames = existing.map(c => c.name);
    
    // Pre-delete non-auth collections in reverse dependency order to avoid constraint errors
    const deleteOrder = [
      'notification_logs',
      'communications',
      'activity_logs',
      'invoices',
      'shipments',
      'packages',
      'bookings',
      'recipients',
      'settings'
    ];
    for (const colName of deleteOrder) {
      const found = existing.find(c => c.name === colName && c.type !== 'auth');
      if (found) {
        try {
          await pb.collections.delete(found.id);
          console.log(`ℹ️ Deleted ${colName} (cleanup before recreate)`);
        } catch (err) {
          console.warn(`⚠️ Could not delete ${colName}: ${err.message || err}`);
        }
      }
    }

    // Refresh existing after deletions
    existing = await pb.collections.getFullList();
    existingNames = existing.map(c => c.name);
    
    // Map names to IDs for relations
    const nameToId = {};
    existing.forEach(c => nameToId[c.name] = c.id);
    // Explicitly set users collection ID
    nameToId['users'] = '_pb_users_auth_';

    for (const col of schema) {
      console.log(`Processing ${col.name}...`);

      // Ensure collection options exists
      if (!col.options) col.options = {};
      if (col.type === 'auth') {
        col.options = {
          allowEmailAuth: true,
          allowOAuth2Auth: true,
          allowUsernameAuth: false,
          minPasswordLength: 8,
          requireEmail: true,
          exceptEmailDomains: null,
          onlyVerified: false,
          manageRule: null,
          createRule: null,
          deleteRule: null,
          updateRule: null,
          listRule: null,
          viewRule: null,
          authRule: null,
          passwordDictionary: null
        };
      }

      // Fix schema fields
      if (col.schema) {
        col.schema = col.schema.map(f => {
          // Always ensure options exists
          if (!f.options) f.options = {};
          // Ensure baseline field flags
          if (f.system === undefined) f.system = false;
          if (f.presentable === undefined) f.presentable = false;
          if (f.unique === undefined) f.unique = false;

          // Fix for PocketBase 0.22+ maxSelect requirement for select/relation
          if (f.type === 'select' || f.type === 'relation') {
            if (f.options.maxSelect === undefined) f.options.maxSelect = 1;
            if (f.options.minSelect === undefined) f.options.minSelect = null;
          }
          
          // Fix relation collectionId using name map
          if (f.type === 'relation' && f.options && nameToId[f.options.collectionId]) {
            f.options.collectionId = nameToId[f.options.collectionId];
            if (f.options.cascadeDelete === undefined) f.options.cascadeDelete = false;
            if (f.options.displayFields === undefined) f.options.displayFields = null;
          }

          // Fix maxSize for JSON fields
          if (f.type === 'json' && f.options.maxSize === undefined) {
            f.options.maxSize = 2000000;
          }

          // Defaults per type
          if (f.type === 'text') {
            if (f.options.min === undefined) f.options.min = null;
            if (f.options.max === undefined) f.options.max = null;
            if (f.options.pattern === undefined) f.options.pattern = "";
          }
          if (f.type === 'number') {
            if (f.options.min === undefined) f.options.min = null;
            if (f.options.max === undefined) f.options.max = null;
          }
          if (f.type === 'date') {
            if (f.options.min === undefined) f.options.min = "";
            if (f.options.max === undefined) f.options.max = "";
          }
          if (f.type === 'file') {
            if (f.options.minSelect === undefined) f.options.minSelect = null;
            if (f.options.maxSelect === undefined) f.options.maxSelect = 1;
            if (f.options.maxSize === undefined) f.options.maxSize = 5242880;
            if (f.options.mimeTypes === undefined) f.options.mimeTypes = null;
            if (f.options.thumbSizes === undefined) f.options.thumbSizes = null;
            if (f.options.protected === undefined) f.options.protected = false;
          }
          
          return f;
        });
      }

      const exists = existingNames.includes(col.name);
      const existingCol = existing.find(c => c.name === col.name);

      // For non-auth collections, delete then recreate to avoid schema drift issues
      if (exists && col.type !== 'auth') {
        try {
          await pb.collections.delete(existingCol.id);
          console.log(`ℹ️ Deleted existing ${col.name} to recreate cleanly`);
          delete nameToId[col.name];
        } catch (err) {
          console.error(`❌ Failed to delete ${col.name}:`, err.message || err);
        }
      }

      // Create or update
      if (col.type === 'auth' && exists) {
        try {
          await pb.collections.update(existingCol.id, col);
          console.log(`✅ Updated ${col.name}`);
          nameToId[col.name] = existingCol.id;
        } catch (err) {
          console.error(`❌ Failed to update ${col.name}:`, err.message || err);
          if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
          if (err.response?.message) console.error('Response message:', err.response.message);
          if (!err.response?.data) console.error(err);
        }
      } else {
        try {
          const created = await pb.collections.create(col);
          console.log(`✅ Created ${col.name}`);
          // Add to mapping for future relations
          nameToId[col.name] = created.id;
        } catch (err) {
          console.error('Payload that failed:', JSON.stringify(col, null, 2));
          console.error(`❌ Failed to create ${col.name}:`, err.message || err);
          if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
          if (err.response?.message) console.error('Response message:', err.response.message);
          if (!err.response?.data) console.error(err);
        }
      }
    }
  } catch (err) {
    console.error('Setup failed:', err.message);
  }
}

setup();
