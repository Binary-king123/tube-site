export function Footer() {
    return (
        <footer className="border-t border-border bg-background py-10 mt-10">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

                    <div className="flex flex-col gap-4">
                        <span className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            TubeX
                        </span>
                        <p className="text-sm text-muted-foreground">
                            The premium aggregator for high quality adult content. Fast, free, and beautiful.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 text-sm">
                        <h4 className="font-semibold text-foreground">Content</h4>
                        <a href="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</a>
                        <a href="/trending" className="text-muted-foreground hover:text-primary transition-colors">Trending</a>
                        <a href="/new" className="text-muted-foreground hover:text-primary transition-colors">New Videos</a>
                    </div>

                    <div className="flex flex-col gap-3 text-sm">
                        <h4 className="font-semibold text-foreground">Legal</h4>
                        <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                        <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                        <a href="/2257" className="text-muted-foreground hover:text-foreground transition-colors">18 U.S.C. 2257</a>
                    </div>

                    <div className="flex flex-col gap-3 text-sm">
                        <h4 className="font-semibold text-foreground">Contact</h4>
                        <a href="/support" className="text-muted-foreground hover:text-foreground transition-colors">Support</a>
                        <a href="/dmca" className="text-muted-foreground hover:text-primary transition-colors">DMCA Notice</a>
                    </div>

                </div>

                <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} TubeX. All rights reserved.
                        All models appearing on this website were 18 years or older at the time of depiction.
                    </p>
                </div>
            </div>
        </footer>
    );
}
