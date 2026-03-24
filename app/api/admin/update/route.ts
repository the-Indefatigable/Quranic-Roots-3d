export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { roots, forms, tenses, nouns, particles, editHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';

const TABLE_MAP = {
  roots,
  forms,
  tenses,
  nouns,
  particles,
} as const;

type TableName = keyof typeof TABLE_MAP;

// Fields allowed to be edited per table
const EDITABLE_FIELDS: Record<TableName, string[]> = {
  roots: ['root', 'meaning'],
  forms: ['meaning', 'semanticMeaning', 'verbMeaning', 'arabicPattern', 'masdar', 'faaeil', 'mafool'],
  tenses: ['arabicName', 'englishName', 'conjugations'],
  nouns: ['lemma', 'lemmaClean', 'meaning', 'type', 'typeAr', 'baab'],
  particles: ['form', 'meaning', 'type'],
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { table, id, updates } = body as {
      table: string;
      id: string;
      updates: Record<string, any>;
    };

    if (!table || !id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Missing table, id, or updates' }, { status: 400 });
    }

    if (!(table in TABLE_MAP)) {
      return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 });
    }

    const tableName = table as TableName;
    const allowedFields = EDITABLE_FIELDS[tableName];

    // Filter to only allowed fields
    const filteredUpdates: Record<string, any> = {};
    for (const [field, value] of Object.entries(updates)) {
      if (allowedFields.includes(field)) {
        filteredUpdates[field] = value;
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Fetch current record for edit history
    const tableRef = TABLE_MAP[tableName] as any;
    const [currentRecord] = await dbQuery(() =>
      db.select().from(tableRef).where(eq(tableRef.id, id))
    );

    if (!currentRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Log each field change to edit_history
    const historyEntries: { adminId: string; tableName: string; recordId: string; fieldName: string; oldValue: string; newValue: string }[] = [];
    for (const [field, newValue] of Object.entries(filteredUpdates)) {
      const oldValue = (currentRecord as any)[field];
      const oldStr = typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue ?? '');
      const newStr = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue ?? '');

      if (oldStr !== newStr) {
        historyEntries.push({
          adminId: session.user.id,
          tableName: table,
          recordId: id,
          fieldName: field,
          oldValue: oldStr,
          newValue: newStr,
        });
      }
    }

    // Apply update
    await dbQuery(() =>
      db
        .update(tableRef)
        .set({ ...filteredUpdates, updatedAt: new Date() })
        .where(eq(tableRef.id, id))
    );

    // Insert edit history
    if (historyEntries.length > 0) {
      await dbQuery(() => db.insert(editHistory).values(historyEntries));
    }

    // Return updated record
    const [updatedRecord] = await dbQuery(() =>
      db.select().from(tableRef).where(eq(tableRef.id, id))
    );

    return NextResponse.json({
      success: true,
      record: updatedRecord,
      changesLogged: historyEntries.length,
    });
  } catch (error) {
    console.error('[admin/update] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
