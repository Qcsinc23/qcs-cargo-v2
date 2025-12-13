#!/usr/bin/env node

/**
 * PocketBase Schema Setup Script
 * 
 * This script creates/updates collections in PocketBase to match the QCS Cargo schema.
 * Run this before E2E tests to ensure the correct schema is in place.
 * 
 * Usage: node scripts/setup-pocketbase-schema.js
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'sales@quietcraftsolutions.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'Qcsinc@2025*';

// QCS Cargo schema collections
const collections = [
  {
    name: 'recipients',
    type: 'base',
    schema: [
      { name: 'user', type: 'relation', options: { collectionId: '_pb_users_auth_', cascadeDelete: true }, required: true },
      { name: 'name', type: 'text', required: true },
      { name: 'phone', type: 'text', required: true },
      { name: 'address_line1', type: 'text', required: false },
      { name: 'address_line2', type: 'text', required: false },
      { name: 'city', type: 'text', required: false },
      { name: 'destination', type: 'text', required: true },
      { name: 'delivery_instructions', type: 'text', required: false },
      { name: 'is_default', type: 'bool', required: false }
    ],
    listRule: '@request.auth.id != "" && user = @request.auth.id',
    viewRule: '@request.auth.id != "" && user = @request.auth.id',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != "" && user = @request.auth.id',
    deleteRule: '@request.auth.id != "" && user = @request.auth.id'
  },
  {
    name: 'bookings',
    type: 'base',
    schema: [
      { name: 'user', type: 'relation', options: { collectionId: '_pb_users_auth_' }, required: true },
      { name: 'confirmation_number', type: 'text', required: false },
      { name: 'tracking_number', type: 'text', required: false },
      { name: 'status', type: 'select', options: { maxSelect: 1, values: ['draft', 'pending', 'pending_payment', 'payment_failed', 'confirmed', 'cancelled'] }, required: false },
      { name: 'service_type', type: 'select', options: { maxSelect: 1, values: ['standard', 'express', 'door_to_door', 'consolidated', 'air_freight'] }, required: false },
      { name: 'destination', type: 'text', required: false },
      { name: 'scheduled_date', type: 'date', required: false },
      { name: 'scheduled_time_slot', type: 'text', required: false },
      { name: 'package_count', type: 'number', required: false },
      { name: 'total_weight_lbs', type: 'number', required: false },
      { name: 'total_declared_value_usd', type: 'number', required: false },
      { name: 'subtotal_usd', type: 'number', required: false },
      { name: 'insurance_usd', type: 'number', required: false },
      { name: 'discount_usd', type: 'number', required: false },
      { name: 'total_cost_usd', type: 'number', required: false },
      { name: 'payment_status', type: 'select', options: { maxSelect: 1, values: ['pending', 'paid', 'failed', 'refunded'] }, required: false },
      { name: 'payment_intent_id', type: 'text', required: false },
      { name: 'payment_error', type: 'text', required: false },
      { name: 'paid_at', type: 'date', required: false },
      { name: 'notes', type: 'text', required: false }
    ],
    listRule: '@request.auth.id != "" && (user = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "staff")',
    viewRule: '@request.auth.id != "" && (user = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "staff")',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != "" && (user = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "staff")',
    deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"'
  },
  {
    name: 'invoices',
    type: 'base',
    schema: [
      { name: 'user', type: 'relation', options: { collectionId: '_pb_users_auth_' }, required: true },
      { name: 'booking', type: 'relation', options: { collectionId: 'bookings' }, required: false },
      { name: 'invoice_number', type: 'text', required: true },
      { name: 'status', type: 'select', options: { maxSelect: 1, values: ['draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded'] }, required: false },
      { name: 'amount', type: 'number', required: true },
      { name: 'currency', type: 'text', required: false },
      { name: 'due_date', type: 'date', required: false },
      { name: 'paid_at', type: 'date', required: false },
      { name: 'line_items', type: 'json', options: { maxSize: 2000000 }, required: false },
      { name: 'notes', type: 'text', required: false }
    ],
    listRule: '@request.auth.id != "" && (user = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "staff")',
    viewRule: '@request.auth.id != "" && (user = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "staff")',
    createRule: '@request.auth.role = "admin" || @request.auth.role = "staff"',
    updateRule: '@request.auth.role = "admin" || @request.auth.role = "staff"',
    deleteRule: '@request.auth.role = "admin"'
  }
];

async function setupSchema() {
  console.log('🔧 PocketBase Schema Setup\n');
  
  try {
    // Authenticate as admin
    console.log('🔐 Authenticating as admin...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Admin authenticated\n');
    
    // Get existing collections
    const existingCollections = await pb.collections.getFullList();
    const existingNames = existingCollections.map(c => c.name);
    
    console.log('📋 Existing collections:', existingNames.join(', '));
    
    // Update users collection to add role field if missing
    console.log('\n👤 Checking users collection...');
    const usersCollection = existingCollections.find(c => c.name === 'users');
    if (usersCollection) {
      const hasRole = usersCollection.schema.some(f => f.name === 'role');
      if (!hasRole) {
        console.log('   Adding role field to users collection...');
        usersCollection.schema.push({
          name: 'role',
          type: 'select',
          options: { values: ['customer', 'staff', 'admin'] },
          required: false
        });
        await pb.collections.update(usersCollection.id, {
          schema: usersCollection.schema
        });
        console.log('   ✅ Role field added');
      } else {
        console.log('   ✅ Role field already exists');
      }
    }
    
    // Get bookings collection ID for invoice relation (if it exists)
    let bookingsCollectionId = 'bookings';
    const refreshedCollections = await pb.collections.getFullList();
    const bookingsCol = refreshedCollections.find(c => c.name === 'bookings');
    if (bookingsCol) {
      bookingsCollectionId = bookingsCol.id;
      console.log(`\n📎 Bookings collection ID: ${bookingsCollectionId}`);
    }
    
    // Update invoices collection to use correct bookings ID
    const invoicesCollection = collections.find(c => c.name === 'invoices');
    if (invoicesCollection) {
      const bookingField = invoicesCollection.schema.find(f => f.name === 'booking');
      if (bookingField) {
        bookingField.options.collectionId = bookingsCollectionId;
      }
    }
    
    // Create or update cargo collections
    for (const collection of collections) {
      console.log(`\n📦 Processing ${collection.name}...`);
      
      if (existingNames.includes(collection.name)) {
        console.log(`   Collection exists, updating schema...`);
        const existing = existingCollections.find(c => c.name === collection.name);
        try {
          await pb.collections.update(existing.id, collection);
          console.log(`   ✅ Updated ${collection.name}`);
        } catch (e) {
          console.log(`   ⚠️  Could not update ${collection.name}: ${e.message}`);
        }
      } else {
        console.log(`   Creating new collection...`);
        try {
          await pb.collections.create(collection);
          console.log(`   ✅ Created ${collection.name}`);
        } catch (e) {
          console.log(`   ❌ Failed to create ${collection.name}: ${e.message}`);
          if (e.response?.data) {
            console.log('   Details:', JSON.stringify(e.response.data, null, 2));
          }
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SCHEMA SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log('\nYou can now run: npm run test:e2e -- tests/e2e/completed-features.spec.ts\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
    process.exit(1);
  }
}

setupSchema();

