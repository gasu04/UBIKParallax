import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SearchHighlightProvider } from "./contexts/SearchHighlightContext";
import Home from "./pages/Home";
import NotePage from "./pages/NotePage";
import GraphPage from "./pages/GraphPage";
import BrowsePage from "./pages/BrowsePage";
import TagsPage from "./pages/TagsPage";
import AboutPage from "./pages/AboutPage";
import Layout from "./components/Layout";

// Detect base path from Vite's import.meta.env.BASE_URL
// In dev: "/" — In GitHub Pages build: "/UBIKParallax/"
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

function Routes() {
  return (
    <Layout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/note/:slug"} component={NotePage} />
        <Route path={"/graph"} component={GraphPage} />
        <Route path={"/browse"} component={BrowsePage} />
        <Route path={"/tags"} component={TagsPage} />
        <Route path={"/tags/:tag"} component={TagsPage} />
        <Route path={"/about"} component={AboutPage} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SearchHighlightProvider>
          <TooltipProvider>
            <Toaster />
            <WouterRouter base={BASE}>
              <Routes />
            </WouterRouter>
          </TooltipProvider>
        </SearchHighlightProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
