
import LoadingSpinner from "./ui/LoadingSpinner";

export default function FullPageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <LoadingSpinner size="lg" />

      <p className="text-sm text-gray-600">
        Loading, please wait...
      </p>
    </div>
  );
}
