#!/usr/bin/env node

/**
 * Migration script to add magic link fields to PocketBase users collection
 * Run this after deploying the updated schema
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ Missing required env vars: POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD');
  process.exit(1);
}

async function addMagicLinkFields() {
  const pb = new PocketBase(POCKETBASE_URL);
  
  try {
    // Authenticate as admin
    console.log('🔐 Authenticating as admin...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated successfully');
    
    // Get users collection
    console.log('📦 Fetching users collection...');
    const collection = await pb.collections.getOne('users');
    
    // Check if fields already exist
    const hasmagic_link_token = collection.schema.some(field => field.name === 'magic_link_token');
    const hasMagicLinkExpires = collection.schema.some(field => field.name === 'magic_link_expires');
    const hasLastLogin = collection.schema.some(field => field.name === 'last_login');
    
    if (hasmagic_link_token && hasMagicLinkExpires && hasLastLogin) {
      console.log('✅ Magic link fields already exist in the schema');
      return;
    }
    
    // Add new fields to schema
    console.log('➕ Adding magic link fields to schema...');
    const updatedSchema = [...collection.schema];
    
    if (!hasmagic_link_token) {
      updatedSchema.push({
        name: 'magic_link_token',
        type: 'text',
        required: false
      });
    }
    
    if (!hasMagicLinkExpires) {
      updatedSchema.push({
        name: 'magic_link_expires',
        type: 'date',
        required: false
      });
    }
    
    if (!hasLastLogin) {
      updatedSchema.push({
        name: 'last_login',
        type: 'date',
        required: false
      });
    }
    
    // Update collection
    await pb.collections.update(collection.id, {
      schema: updatedSchema
    });
    
    console.log('✅ Successfully added magic link fields!');
    console.log('   - magic_link_token (text)');
    console.log('   - magic_link_expires (date)');
    console.log('   - last_login (date)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
    process.exit(1);
  }
}

addMagicLinkFields();
