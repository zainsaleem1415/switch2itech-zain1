export function FeatureCard({ icon: title, description }) {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50 group">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="mb-1 font-bold text-foreground tracking-tight">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}