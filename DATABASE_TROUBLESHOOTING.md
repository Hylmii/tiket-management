# Database Troubleshooting Guide

## Common Database Issues and Solutions

### 1. "Unable to open the database file" Error

**Symptoms:**
```
Error code 14: Unable to open the database file
Invalid `prisma.user.findUnique()` invocation
```

**Cause:**
The SQLite database file is locked by another process (usually Prisma Studio or development server).

**Solution:**
```bash
# 1. Check what processes are using the database
lsof prisma/dev.db

# 2. Kill the processes using the database
pkill -f "prisma studio"
pkill -f "next dev"

# 3. Verify database is unlocked
lsof prisma/dev.db  # Should return nothing

# 4. Push database schema to ensure it's up to date
npx prisma db push

# 5. Restart development server
npm run dev
```

### 2. Database Schema Out of Sync

**Symptoms:**
- Missing tables or columns
- Prisma client errors

**Solution:**
```bash
# Reset and push schema
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 3. Seed Data Issues

**Symptoms:**
```
Unique constraint failed on the fields: (`name`)
```

**Solution:**
```bash
# Reset database and run seed
npx prisma migrate reset --force
npx prisma db seed
```

### 4. Performance Issues

**Solutions:**
- Consider switching to PostgreSQL for production
- Monitor database file size
- Implement proper indexing

## Best Practices

1. **Always close Prisma Studio** when not needed
2. **Use transactions** for multiple related operations
3. **Implement proper error handling** for database operations
4. **Regular backups** of production database
5. **Monitor database file permissions**

## Database File Locations

- **Development**: `prisma/dev.db`
- **Migrations**: `prisma/migrations/`
- **Schema**: `prisma/schema.prisma`

## Emergency Commands

```bash
# Force unlock database (use with caution)
rm -f prisma/dev.db-wal prisma/dev.db-shm

# Recreate database from scratch
rm prisma/dev.db
npx prisma db push
npx prisma db seed
```

## Production Considerations

For production, consider:
- Using PostgreSQL instead of SQLite
- Implementing connection pooling
- Setting up proper backup strategies
- Monitoring database performance
