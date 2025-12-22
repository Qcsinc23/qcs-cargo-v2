#!/usr/bin/env node

/**
 * Migration script to add kinde_id field to PocketBase users collection
 * 
 * This script:
 * 1. Authenticates as PocketBase admin
 * 2. Gets the users collection
 * 3. Adds the kinde_id field if it doesn't exist
 * 
 * Usage: node scripts/add-kinde-id-field.js
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090');
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL || 'sales@quietcraftsolutions.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD || 'Qcsinc@2025*';

async function addKindeIdField() {
  try {
    console.log('🔐 Authenticating as PocketBase admin...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated\n');

    console.log('📋 Getting users collection...');
    const collections = await pb.collections.getFullList();
    const usersCollection = collections.find(c => c.name === 'users' && c.type === 'auth');
    
    if (!usersCollection) {
      throw new Error('Users collection not found');
    }

    console.log(`✅ Found users collection (ID: ${usersCollection.id})\n`);

    // Check if kinde_id field already exists
    const hasKindeId = usersCollection.schema.some(f => f.name === 'kinde_id');
    
    if (hasKindeId) {
      console.log('✅ kinde_id field already exists in users collection');
      return;
    }

    console.log('➕ Adding kinde_id field to users collection...');
    
    // Add the kinde_id field to the schema
    const updatedSchema = [
      ...usersCollection.schema,
      {
        name: 'kinde_id',
        type: 'text',
        required: false,
        system: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      }
    ];

    // Update the collection
    await pb.collections.update(usersCollection.id, {
      schema: updatedSchema
    });

    console.log('✅ Successfully added kinde_id field to users collection');
    console.log('\n📝 Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message || error);
    process.exit(1);
  }
}

addKindeIdField();

