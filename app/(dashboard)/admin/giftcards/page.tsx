"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Edit } from "lucide-react";
import { GiftCard } from "@/types";

export default function AdminGiftCardsPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isSignedIn && user) {
      const admin = user.publicMetadata?.role === "admin" || user.publicMetadata?.admin === true;
      if (!admin) {
        router.push("/");
        return;
      }

      fetchGiftCards();
    }
  }, [isSignedIn, isLoaded, user, router]);

  const fetchGiftCards = async () => {
    try {
      const response = await fetch("/api/admin/giftcards");
      if (!response.ok) {
        throw new Error("Failed to fetch gift cards");
      }
      const data = await response.json();
      setGiftCards(data);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gift Card Management</h1>
          <p className="text-muted-foreground">Manage available gift card brands and products</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Gift Card
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Gift Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Denominations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reloadly ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {giftCards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No gift cards found
                  </TableCell>
                </TableRow>
              ) : (
                giftCards.map((giftCard) => (
                  <TableRow key={giftCard._id}>
                    <TableCell className="font-semibold">{giftCard.brand}</TableCell>
                    <TableCell>{giftCard.name}</TableCell>
                    <TableCell>{giftCard.category || "-"}</TableCell>
                    <TableCell>
                      ${giftCard.denominations.join(", $")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={giftCard.active ? "default" : "secondary"}>
                        {giftCard.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {giftCard.reloadlyProductId}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

