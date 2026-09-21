import NavChrome from "@/components/behaviours/NavChrome";

// Every page but home carries only the nav chrome: the theme toggles, the
// mobile menu, the scrolled glass and the scroll-to-top disc. The contact
// page mounts its form's scripts itself.
export default function PageBehaviours() {
  return <NavChrome />;
}
