// Simple Router for Digital Skills E-Portfolio

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
    }

    /**
     * Register a route with its view handler
     */
    register(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * Navigate to a specified route
     */
    navigate(path, params = {}) {
        if (this.routes[path]) {
            this.currentRoute = path;
            this.routes[path](params);
            
            // Update URL without page reload
            window.history.pushState({ path, params }, '', `#${path}`);
        } else {
            console.error(`Route ${path} not found`);
            this.navigate('/login');
        }
    }

    /**
     * Navigate back
     */
    back() {
        window.history.back();
    }

    /**
     * Initialize router with hash change listener
     */
    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || '/login';
            this.navigate(hash);
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.path) {
                this.navigate(event.state.path, event.state.params);
            }
        });

        // Navigate to initial route
        const initialHash = window.location.hash.slice(1) || '/login';
        this.navigate(initialHash);
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Create global router instance
const router = new Router();
