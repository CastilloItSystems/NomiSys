/**
 * Nomina Layout
 * Shared layout for all nomina-related routes
 */

export const metadata = {
  title: "Nómina",
};

export default function NominaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
