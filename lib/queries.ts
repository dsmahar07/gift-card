import { db } from "@/lib/db";
import { giftCards } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Cache gift card categories
export const getCategories = unstable_cache(
  async () => {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }
      
      const results = await db
        .selectDistinct({ category: giftCards.category })
        .from(giftCards)
        .where(sql`${giftCards.category} IS NOT NULL`);

      return results.map((r) => r.category).filter(Boolean) as string[];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
  ["giftcard-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

// Cache gift card brands
export const getBrands = unstable_cache(
  async () => {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }
      
      const results = await db
        .selectDistinct({ brand: giftCards.brand })
        .from(giftCards);

      return results.map((r) => r.brand).sort();
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  },
  ["giftcard-brands"],
  { revalidate: 3600, tags: ["brands"] }
);

// Get all gift cards with filters - OPTIMIZED
export async function getAllGiftCards(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not configured");
      return [];
    }

    const conditions = [eq(giftCards.active, true)];

    // Exact brand match from header dropdown (faster than LIKE)
    if (searchParams.brand) {
      conditions.push(eq(giftCards.brand, searchParams.brand as string));
    }

    if (searchParams.category) {
      conditions.push(eq(giftCards.category, searchParams.category as string));
    }

    // Case-insensitive search across brand and name
    if (searchParams.search) {
      const term = `%${String(searchParams.search).toLowerCase()}%`;
      conditions.push(
        sql`(lower(${giftCards.brand}) like ${term} OR lower(${giftCards.name}) like ${term})`
      );
    }

    const results = await db
      .select({
        id: giftCards.id,
        name: giftCards.name,
        brand: giftCards.brand,
        category: giftCards.category,
        image: giftCards.image,
        denominations: giftCards.denominations,
        active: giftCards.active,
        reloadlyProductId: giftCards.reloadlyProductId,
      })
      .from(giftCards)
      .where(sql`${sql.join(conditions, sql` AND `)}`)
      .orderBy(giftCards.brand)
      .limit(100); // Limit for faster query

    return results.map((card) => ({
      ...card,
      _id: card.id.toString(),
      category: card.category ?? undefined,
      denominations: JSON.parse(card.denominations),
    }));
  } catch (error) {
    console.error("Error fetching gift cards:", error);
    return [];
  }
}

// Get gift card by brand slug - FAST VERSION
export async function getGiftCardByBrand(brandSlug: string) {
  const normalizedSlug = brandSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  try {
    // FASTEST: Direct query with limit 1
    const results = await db
      .select()
      .from(giftCards)
      .where(eq(giftCards.active, true))
      .limit(50); // Get small set, match in memory

    // Find exact match
    const matchedCard = results.find((card) => {
      const cardSlug = card.brand
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      return cardSlug === normalizedSlug;
    });

    if (!matchedCard) {
      return null;
    }

    return {
      ...matchedCard,
      _id: matchedCard.id.toString(),
      category: matchedCard.category ?? undefined,
      denominations: JSON.parse(matchedCard.denominations),
      reloadlyProductId: matchedCard.reloadlyProductId,
    };
  } catch (error) {
    console.error("Error fetching gift card:", error);
    return null;
  }
}

// Get gift card by ID
export async function getGiftCardById(id: string) {
  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return null;
    
    const results = await db
      .select()
      .from(giftCards)
      .where(sql`${giftCards.id} = ${numericId} AND ${giftCards.active} = true`)
      .limit(1);
      
    if (results.length === 0) return null;
    
    const card = results[0];
    return {
      ...card,
      _id: card.id.toString(),
      category: card.category ?? undefined,
      denominations: JSON.parse(card.denominations),
      reloadlyProductId: card.reloadlyProductId,
    };
  } catch (error) {
    console.error("Error fetching gift card by id:", error);
    return null;
  }
}

// Get related gift cards
export async function getRelatedGiftCards(category: string | undefined, currentId: string, limit: number = 4) {
  try {
    const conditions = [eq(giftCards.active, true)];
    if (category) {
      conditions.push(eq(giftCards.category, category));
    }
    
    const results = await db
      .select()
      .from(giftCards)
      .where(sql`${sql.join(conditions, sql` AND `)} AND ${giftCards.id}::text != ${currentId}`)
      .limit(limit);

    return results.map((card) => ({
      ...card,
      _id: card.id.toString(),
      category: card.category ?? undefined,
      denominations: JSON.parse(card.denominations),
      reloadlyProductId: card.reloadlyProductId,
    }));
  } catch (error) {
    console.error("Error fetching related gift cards:", error);
    return [];
  }
}

