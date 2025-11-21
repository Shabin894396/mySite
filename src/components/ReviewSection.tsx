import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review: string;
  created_at: string;
  edited_at?: string;
  email?: string; // we manually attach email
};

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [editing, setEditing] = useState<{ id: string; text: string; rating: number } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadReviews();
  }, [productId]);

  // -------------------------------
  // LOAD REVIEWS + ATTACH USER EMAIL
  // -------------------------------
  async function loadReviews() {
    const { data: reviewsRow, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    // Manually attach user email for each review
    const finalReviews: Review[] = [];

    for (const r of reviewsRow || []) {
      let email = "Unknown User";

      const { data: userInfo } = await supabase.auth.admin.getUserById(r.user_id);
      if (userInfo?.user?.email) {
        email = userInfo.user.email;
      }

      finalReviews.push({ ...r, email });
    }

    setReviews(finalReviews);
  }

  // -------------------------------
  // SUBMIT A NEW REVIEW
  // -------------------------------
  async function submitReview() {
    const {
      data: { user: currentUser }
    } = await supabase.auth.getUser();

    if (!currentUser) {
      toast.error("Please log in to review.");
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .upsert(
        {
          product_id: productId,
          user_id: currentUser.id,
          rating,
          review: reviewText,
          edited_at: null,
        },
        { onConflict: "product_id,user_id" }
      );

    if (error) {
      toast.error("Failed to submit review.");
      console.error(error);
      return;
    }

    toast.success("Review submitted!");
    setReviewText("");
    loadReviews();
  }

  // -------------------------------
  // EDITING A REVIEW
  // -------------------------------
  function startEdit(r: Review) {
    setEditing({ id: r.id, text: r.review, rating: r.rating });
  }

  async function saveEdit() {
    if (!editing) return;

    const { error } = await supabase
      .from("reviews")
      .update({
        review: editing.text,
        rating: editing.rating,
        edited_at: new Date().toISOString()
      })
      .eq("id", editing.id);

    if (error) {
      toast.error("Failed to update review");
      console.error(error);
      return;
    }

    toast.success("Review updated");
    setEditing(null);
    loadReviews();
  }

  // -------------------------------
  // DELETE REVIEW
  // -------------------------------
  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete review");
      console.error(error);
      return;
    }

    toast.success("Review deleted");
    loadReviews();
  }

  const isAdmin = user?.user_metadata?.role === "admin";

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold mb-4">Reviews</h3>

      {/* LIST REVIEWS */}
      <div className="space-y-4 mb-6">
        {reviews.map((r) => (
          <div key={r.id} className="border p-3 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.email}</p>
                <p className="text-yellow-500">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {user?.id === r.user_id && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => startEdit(r)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteReview(r.id)}>Delete</Button>
                  </>
                )}

                {isAdmin && user?.id !== r.user_id && (
                  <Button size="sm" variant="destructive" onClick={() => deleteReview(r.id)}>Delete</Button>
                )}
              </div>
            </div>

            <p className="mt-2">{r.review}</p>

            {r.edited_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Edited on {new Date(r.edited_at).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* EDIT FORM */}
      {editing ? (
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">Edit your review</h4>

          <select
            value={editing.rating}
            onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
            className="border p-2 rounded w-full mb-2"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>

          <textarea
            value={editing.text}
            onChange={(e) => setEditing({ ...editing, text: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          />

          <div className="flex gap-2">
            <Button onClick={saveEdit}>Save</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      ) : (
        /* SUBMIT NEW REVIEW */
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">Write a Review</h4>

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border p-2 rounded w-full mb-2"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full border p-2 rounded mb-2"
            placeholder="Write your review..."
          />

          <Button className="w-full" onClick={submitReview}>
            Submit Review
          </Button>
        </div>
      )}
    </div>
  );
}
