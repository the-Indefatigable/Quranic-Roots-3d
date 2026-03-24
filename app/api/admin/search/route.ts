export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { roots, forms, tenses, nouns, particles } from '@/db/schema';
import { eq, ilike, or, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const tab = searchParams.get('tab') || 'roots';
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 30;
    const offset = (page - 1) * limit;

    if (tab === 'roots') {
      const filter = query
        ? or(
            ilike(roots.root, `%${query}%`),
            ilike(roots.meaning, `%${query}%`)
          )
        : undefined;

      const [items, countResult] = await Promise.all([
        dbQuery(() =>
          db
            .select()
            .from(roots)
            .where(filter)
            .orderBy(roots.root)
            .limit(limit)
            .offset(offset)
        ),
        dbQuery(() =>
          db
            .select({ count: sql<number>`count(*)` })
            .from(roots)
            .where(filter)
        ),
      ]);

      // For each root, fetch its forms and tenses
      const rootIds = items.map((r) => r.id);
      const allForms =
        rootIds.length > 0
          ? await dbQuery(() =>
              db
                .select()
                .from(forms)
                .where(sql`${forms.rootId} IN ${rootIds}`)
                .orderBy(forms.sortOrder)
            )
          : [];

      const formIds = allForms.map((f) => f.id);
      const allTenses =
        formIds.length > 0
          ? await dbQuery(() =>
              db
                .select()
                .from(tenses)
                .where(sql`${tenses.formId} IN ${formIds}`)
            )
          : [];

      // Group forms by rootId, tenses by formId
      const formsByRoot = new Map<string, typeof allForms>();
      for (const form of allForms) {
        const list = formsByRoot.get(form.rootId) || [];
        list.push(form);
        formsByRoot.set(form.rootId, list);
      }

      const tensesByForm = new Map<string, typeof allTenses>();
      for (const tense of allTenses) {
        const list = tensesByForm.get(tense.formId) || [];
        list.push(tense);
        tensesByForm.set(tense.formId, list);
      }

      const enrichedItems = items.map((root) => ({
        ...root,
        forms: (formsByRoot.get(root.id) || []).map((form) => ({
          ...form,
          tenses: tensesByForm.get(form.id) || [],
        })),
      }));

      return NextResponse.json({
        items: enrichedItems,
        total: Number(countResult[0]?.count || 0),
        page,
        limit,
      });
    }

    if (tab === 'nouns') {
      const filter = query
        ? or(
            ilike(nouns.lemma, `%${query}%`),
            ilike(nouns.lemmaClean, `%${query}%`),
            ilike(nouns.meaning, `%${query}%`)
          )
        : undefined;

      const [items, countResult] = await Promise.all([
        dbQuery(() =>
          db
            .select()
            .from(nouns)
            .where(filter)
            .orderBy(nouns.lemma)
            .limit(limit)
            .offset(offset)
        ),
        dbQuery(() =>
          db
            .select({ count: sql<number>`count(*)` })
            .from(nouns)
            .where(filter)
        ),
      ]);

      return NextResponse.json({
        items,
        total: Number(countResult[0]?.count || 0),
        page,
        limit,
      });
    }

    if (tab === 'particles') {
      const filter = query
        ? or(
            ilike(particles.form, `%${query}%`),
            ilike(particles.meaning, `%${query}%`),
            ilike(particles.type, `%${query}%`)
          )
        : undefined;

      const [items, countResult] = await Promise.all([
        dbQuery(() =>
          db
            .select()
            .from(particles)
            .where(filter)
            .orderBy(particles.form)
            .limit(limit)
            .offset(offset)
        ),
        dbQuery(() =>
          db
            .select({ count: sql<number>`count(*)` })
            .from(particles)
            .where(filter)
        ),
      ]);

      return NextResponse.json({
        items,
        total: Number(countResult[0]?.count || 0),
        page,
        limit,
      });
    }

    return NextResponse.json({ error: 'Invalid tab' }, { status: 400 });
  } catch (error) {
    console.error('[admin/search] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
