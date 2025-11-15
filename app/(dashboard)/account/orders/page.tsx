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
import { Loader2, Eye, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import { decrypt } from "@/lib/encryption";

function getStatusBadge(status: Order["status"]) {
  const variants: Record<Order["status"], "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    processing: "secondary",
    completed: "default",
    failed: "destructive",
    cancelled: "outline",
  };

  return (
    <Badge variant={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function OrdersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/account/orders");
      return;
    }

    if (isSignedIn) {
      // Sync user to database
      fetch("/api/users/sync", { method: "POST" }).catch(console.error);
      fetchOrders();
    }
  }, [isSignedIn, isLoaded, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const revealCode = (orderId: string, encryptedCode: string) => {
    try {
      const decrypted = decrypt(encryptedCode);
      setRevealedCodes((prev) => ({ ...prev, [orderId]: decrypted }));
    } catch (error) {
      toast.error("Failed to decrypt code");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View and manage your gift card purchases
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 sm:py-12 text-center">
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">No orders yet</p>
            <Link href="/">
              <Button className="text-sm sm:text-base">Browse Store</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Order History</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">Order ID</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">Brand</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">Amount</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">
                      {order._id?.toString().slice(-8)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm whitespace-nowrap">{order.giftCardBrand}</TableCell>
                    <TableCell className="text-xs sm:text-sm whitespace-nowrap">${order.denomination}</TableCell>
                    <TableCell className="whitespace-nowrap">{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Link href={`/account/orders/${order._id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 px-2 sm:px-3">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

