import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Star, Loader2 } from "lucide-react";
import testimonialService from "../../api/testimonialService";

export function ReviewForm({ open, onOpenChange, productName, productId }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    setLoading(true);
    try {
      await testimonialService.createTestimonial({
        authorNameOverride: name,
        authorRoleOverride: role,
        rating: rating,
        content: comment,
        product: productId
      });

      // Reset form
      setName("");
      setRole("");
      setRating(0);
      setComment("");
      onOpenChange(false);
      alert("Thank you for your review!");
    } catch (error) {
      console.error("Failed to submit review", error);
      alert("Failed to submit review. It may require approval or you might need to try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg">Write a Review</Dialog.Title>
            <Dialog.Close className="rounded-full p-1 hover:bg-gray-100 transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="mb-6 text-gray-600">
            Share your experience with ProWorkflow Suite to help others make
            informed decisions.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block">
                Your Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="role" className="mb-2 block">
                Your Role <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                placeholder="e.g., Product Manager, Developer"
              />
            </div>

            <div>
              <label className="mb-2 block">
                Rating <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                        }`}
                    />
                  </button>
                ))}
              </div>
              {rating === 0 && (
                <p className="mt-1 text-sm text-gray-500">Click to rate</p>
              )}
            </div>

            <div>
              <label htmlFor="comment" className="mb-2 block">
                Your Review <span className="text-red-600">*</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                placeholder="Tell us about your experience..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={rating === 0 || loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Submit Review
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-6 py-3 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
