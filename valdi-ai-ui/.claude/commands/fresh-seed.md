---
description: Reset database and run seeders with verification
---

Reset the database and seed with comprehensive verification:

## Database Reset Process

1. **Pre-Reset Status**
   - Check current database state
   - Verify Sail is running
   - Confirm database connection
   - Backup current data if needed

2. **Execute Fresh Seeding**
   - Run: `./scripts/dev.sh fresh`
   - Monitor output for errors
   - Watch for seeder execution

3. **Verify Core Data**
   - **Roles**: Should have 3 (Admin, Technician, Customer)
   - **Permissions**: Should have 39
   - **Services**: Should have 10 baseline services
   - **Admin User**: admin@pcrcard.com should exist
   - **Menu Items**: Should have 29 Nova menu items

4. **Verify Development Data**
   - **Test Users**: Check for dev.*, dusk.* users
   - **Submissions**: Verify sample submissions created
   - **Trading Cards**: Check user-defined and reference cards
   - **Promo Codes**: Verify test promo codes exist

5. **Verify Database Integrity**
   - Run query: `SELECT COUNT(*) FROM users;`
   - Run query: `SELECT COUNT(*) FROM roles;`
   - Run query: `SELECT COUNT(*) FROM permissions;`
   - Run query: `SELECT COUNT(*) FROM services;`
   - Check for foreign key violations

6. **Test Database Access**
   - Login as admin@pcrcard.com / admin123!
   - Access Nova admin panel
   - Verify dashboard loads
   - Check menu structure

7. **Output Summary**
   - Total seeding time
   - Records created per table
   - Any warnings or errors
   - Final status (success/failure)

Provide a "Database Ready" confirmation or list any issues found.
