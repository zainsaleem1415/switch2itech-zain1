import { useState } from "react";
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

export default function App({ product, onBack }) {
  const [quantity, setQuantity] = useState(1);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

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

  const reviews = [
    {
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?q=80&w=1080",
      role: "Product Manager",
      rating: 5,
      comment: `This ${product.category} has completely transformed how our team works. Best purchase we've made this year!`,
      date: "Feb 15, 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 border-2 border-black">
      {/* Header with Back Button */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </button>
              <h1 className="font-semibold text-2xl text-gray-800">
                {product.name}
              </h1>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Products
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Support
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Account
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Product Overview Section */}
        <div className="mb-16 grid gap-12 lg:grid-cols-2">
          <div>
            <ProductGallery images={productImages} />
          </div>

          <div className="flex flex-col">
            <div className="mb-2 inline-flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 font-medium">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>4.9</span>
                <span className="text-gray-600">(Verified Asset)</span>
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              {product.name}
            </h1>

            <p className="mb-6 text-gray-700 leading-relaxed">{product.desc}</p>

            <div className="mb-6 rounded-lg bg-gray-100 p-6 border border-gray-200">
              <div className="mb-4 flex items-baseline gap-3">
                <span className="text-gray-500 line-through text-lg">$299</span>
                <span className="text-blue-600 text-3xl font-bold">$199</span>
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-700 text-sm font-bold">
                  Save $100
                </span>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Lifetime access to {product.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Stack: {product.techStack?.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>
                    Priority support for {product.clients || "Enterprise"}
                  </span>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <label htmlFor="quantity" className="font-medium text-gray-700">
                  Licenses:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="rounded-lg border border-gray-300 px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 License - $199</option>
                  <option value={5}>5 Licenses - $899</option>
                  <option value={10}>10 Licenses - $1,599</option>
                </select>
              </div>

              <button className="w-full md:w-2/3 rounded-lg bg-blue-600 px-6 py-4 text-white font-bold transition-all hover:bg-blue-700 shadow-lg active:scale-95">
                Buy {product.name} Now
              </button>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Limited Time Offer:</strong> Get 33% off before Feb 28,
                2026
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              Technical Specifications
            </h2>
            <p className="text-gray-600">
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-3 text-3xl font-bold text-gray-900">
                Customer Reviews
              </h2>
              <p className="text-gray-600">Verified feedback for this asset</p>
            </div>
            <button
              onClick={() => setReviewFormOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold transition-all hover:bg-blue-700 active:scale-95 shadow-md"
            >
              <Plus className="h-5 w-5" />
              Write a Review
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>
        </section>

        {/* Review Form Component */}
        <ReviewForm
          open={reviewFormOpen}
          onOpenChange={setReviewFormOpen}
          productName={product.name}
          productId={product._id}
        />

        {/* FAQ Section */}
        <section className="mb-16 hidden">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            <details className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md">
              <summary className="cursor-pointer list-none font-semibold text-lg text-gray-800">
                <div className="flex items-center justify-between">
                  <h3>What is included in the tech stack?</h3>
                  <span className="text-gray-400 transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </div>
              </summary>
              <p className="mt-4 text-gray-600">
                This asset is built using: {product.techStack?.join(", ")}. It
                includes full source code and setup documentation.
              </p>
            </details>

            <details className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md">
              <summary className="cursor-pointer list-none font-semibold text-lg text-gray-800">
                <div className="flex items-center justify-between">
                  <h3>Is there a refund policy?</h3>
                  <span className="text-gray-400 transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </div>
              </summary>
              <p className="mt-4 text-gray-600">
                Yes! We offer a 30-day money-back guarantee if you're not
                satisfied with the {product.category} asset.
              </p>
            </details>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white hidden">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center text-gray-600">
          <p>© 2026 Switch2ITech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
