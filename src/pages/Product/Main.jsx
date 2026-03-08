import { useState, useEffect } from "react";
import {
  Star,
  Check,
  Download,
  Shield,
  Zap,
  Users,
  BarChart,
  Lock,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { ProductGallery } from "./ProductGallery";
import { FeatureCard } from "./FeatureCard";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import testimonialService from "../../api/testimonialService";
import productService from "../../api/productService";
import { useParams, useNavigate } from "react-router-dom";

const formatReviewDate = (value) => {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const resolveProductId = (product) => product?._id || product?.id || null;

const mapReviewForCard = (review, product) => ({
  name: review.authorNameOverride || review.author?.name || "Anonymous",
  avatar:
    review.authorAvatarOverride ||
    review.author?.profile ||
    `https://i.pravatar.cc/150?u=${review._id || review.content || resolveProductId(product)}`,
  role: review.authorRoleOverride || review.author?.role || "Customer",
  rating: review.rating || 5,
  comment:
    review.content ||
    `This ${product.category} has completely transformed how our team works.`,
  date: formatReviewDate(review.createdAt),
});

const fetchProductReviews = async (product) => {
  const productId = resolveProductId(product);
  if (!productId) return [];
  const response = await testimonialService.getTestimonials({
    product: productId,
  });
  const fetched = response.data?.data || [];
  return fetched
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .map((review) => mapReviewForCard(review, product));
};

export default function App({ product: propProduct, onBack }) {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(propProduct || null);
  const [loading, setLoading] = useState(!propProduct && !!paramId);

  const productId = resolveProductId(product) || paramId;
  const [quantity, setQuantity] = useState(1);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!propProduct && paramId) {
      let isMounted = true;
      setLoading(true);
      productService.getProductById(paramId)
        .then((res) => {
          if (isMounted) setProduct(res.data?.data);
        })
        .catch(err => console.error("Failed to fetch product for details page", err))
        .finally(() => {
          if (isMounted) setLoading(false);
        });
      return () => { isMounted = false; };
    }
  }, [propProduct, paramId]);

  useEffect(() => {
    if (!productId || !product) return;
    let ignore = false;

    fetchProductReviews(product)
      .then((data) => {
        if (!ignore) setReviews(data);
      })
      .catch((error) => {
        console.error("Failed to fetch product reviews:", error);
        if (!ignore) setReviews([]);
      });

    return () => {
      ignore = true;
    };
  }, [product, productId]);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-semibold tracking-widest uppercase">Loading Asset...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-semibold">Asset not found.</p>
        <button onClick={handleBack} className="text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  // --- MAPPING SCHEMA DATA ---
  const productImages =
    product.image?.length > 0
      ? product.image
      : [
        product.thumbnail ||
        "https://images.unsplash.com/photo-1759752394755-1241472b589d?q=80&w=1080",
      ];

  const features = [
    {
      icon: Zap,
      title: "Tech Stack",
      description:
        product.techStack?.join(", ") ||
        "Optimized with modern frameworks for high performance.",
    },
    {
      icon: Shield,
      title: "Enterprise Ready",
      description:
        "Bank-level encryption and security protocols to keep your data safe.",
    },
    {
      icon: Users,
      title: "Client Target",
      description:
        product.clients ||
        "Designed for seamless team collaboration in digital workplaces.",
    },
    {
      icon: BarChart,
      title: "Data Category",
      description: `Classified under ${product.category} for specialized professional workflows.`,
    },
    {
      icon: Lock,
      title: "Privacy First",
      description:
        "Your data stays yours. We never sell or share your information.",
    },
    {
      icon: Download,
      title: "Asset Delivery",
      description:
        "Instant access to all digital assets and documentation upon purchase.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 sm:px-4 py-2 text-foreground transition-colors hover:bg-muted shrink-0 text-sm"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                Back
              </button>
              <h1 className="font-semibold text-base sm:text-2xl text-foreground truncate">
                {product.name}
              </h1>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Products
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Support
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Account
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-12">
        {/* Product Overview Section */}
        <div className="mb-10 sm:mb-16 grid gap-6 sm:gap-12 lg:grid-cols-2">
          <div>
            <ProductGallery images={productImages} />
          </div>

          <div className="flex flex-col">
            <div className="mb-2 inline-flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary font-medium">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.9</span>
                <span className="text-muted-foreground hidden sm:inline">(Verified Asset)</span>
              </div>
            </div>

            <h1 className="mb-4 text-2xl sm:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            <p className="mb-6 text-muted-foreground leading-relaxed">
              {product.desc}
            </p>

            <div className="mb-6 rounded-lg bg-card p-4 sm:p-6 border border-border">
              <div className="mb-4 flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-muted-foreground line-through text-base sm:text-lg">
                  $299
                </span>
                <span className="text-primary text-2xl sm:text-3xl font-bold">$199</span>
                <span className="rounded-full bg-destructive/10 px-2.5 sm:px-3 py-1 text-destructive text-xs sm:text-sm font-bold">
                  Save $100
                </span>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Lifetime access to {product.name}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Stack: {product.techStack?.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>
                    Priority support for {product.clients || "Enterprise"}
                  </span>
                </div>
              </div>

              <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label htmlFor="quantity" className="font-medium text-foreground text-sm sm:text-base">
                  Licenses:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full sm:w-auto rounded-lg border border-input px-3 sm:px-4 py-2 bg-background text-foreground outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value={1}>1 License - $199</option>
                  <option value={5}>5 Licenses - $899</option>
                  <option value={10}>10 Licenses - $1,599</option>
                </select>
              </div>

              <button className="w-full sm:w-auto sm:min-w-[220px] rounded-lg bg-primary px-5 sm:px-6 py-3.5 sm:py-4 text-primary-foreground font-bold transition-all hover:bg-primary/90 shadow-lg active:scale-95 text-sm sm:text-base">
                Buy {product.name} Now
              </button>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
              <p className="text-primary text-sm">
                <strong>Limited Time Offer:</strong> Get 33% off before Feb 28,
                2026
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl sm:text-3xl font-bold text-foreground">
              Technical Specifications
            </h2>
            <p className="text-muted-foreground">
              Everything powering your new digital asset
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mb-16">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="mb-3 text-2xl sm:text-3xl font-bold text-foreground">
                Customer Reviews
              </h2>
              <p className="text-muted-foreground">
                Verified feedback for this asset
              </p>
            </div>
            <button
              onClick={() => setReviewFormOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-5 sm:px-6 py-3 text-primary-foreground font-semibold transition-all hover:bg-primary/90 active:scale-95 shadow-md text-sm sm:text-base"
            >
              <Plus className="h-5 w-5" />
              Write a Review
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <ReviewCard key={`${review.name}-${index}`} {...review} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No reviews yet. Be the first to write one.
              </p>
            )}
          </div>
        </section>

        {/* Review Form Component */}
        <ReviewForm
          open={reviewFormOpen}
          onOpenChange={setReviewFormOpen}
          productName={product.name}
          productId={productId}
          onSubmitted={() => {
            fetchProductReviews(product)
              .then((data) => setReviews(data))
              .catch((error) => {
                console.error("Failed to refresh product reviews:", error);
              });
          }}
        />

        {/* FAQ Section */}
        <section className="mb-16 hidden">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            <details className="group rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md">
              <summary className="cursor-pointer list-none font-semibold text-lg text-foreground">
                <div className="flex items-center justify-between">
                  <h3>What is included in the tech stack?</h3>
                  <span className="text-muted-foreground transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </div>
              </summary>
              <p className="mt-4 text-muted-foreground">
                This asset is built using: {product.techStack?.join(", ")}. It
                includes full source code and setup documentation.
              </p>
            </details>

            <details className="group rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md">
              <summary className="cursor-pointer list-none font-semibold text-lg text-foreground">
                <div className="flex items-center justify-between">
                  <h3>Is there a refund policy?</h3>
                  <span className="text-muted-foreground transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </div>
              </summary>
              <p className="mt-4 text-muted-foreground">
                Yes! We offer a 30-day money-back guarantee if you're not
                satisfied with the {product.category} asset.
              </p>
            </details>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card hidden">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center text-muted-foreground">
          <p>© 2026 Switch2ITech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
