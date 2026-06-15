import { Restaurant } from "@/types";

const CUISINE_COLORS: Record<string, string> = {
  Mexican: "bg-orange-100 text-orange-800",
  "North Indian": "bg-red-100 text-red-800",
  Chinese: "bg-yellow-100 text-yellow-800",
  Asian: "bg-green-100 text-green-800",
  Italian: "bg-green-100 text-green-800",
  Pizza: "bg-red-100 text-red-800",
  "Fast Food": "bg-purple-100 text-purple-800",
  Korean: "bg-pink-100 text-pink-800",
  Continental: "bg-blue-100 text-blue-800",
  Kebab: "bg-amber-100 text-amber-800",
  Seafood: "bg-cyan-100 text-cyan-800",
  Thai: "bg-lime-100 text-lime-800",
  Cafe: "bg-stone-100 text-stone-800",
  Beverages: "bg-sky-100 text-sky-800",
  Desserts: "bg-rose-100 text-rose-800",
  Salad: "bg-emerald-100 text-emerald-800",
  default: "bg-gray-100 text-gray-700",
};

function cuisineColor(cuisine: string) {
  return CUISINE_COLORS[cuisine] ?? CUISINE_COLORS.default;
}

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-5 flex flex-col gap-3 border border-gray-100">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
        {restaurant.tagline && (
          <p className="text-sm text-gray-500 mt-0.5">{restaurant.tagline}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {restaurant.cuisines.map((c) => (
          <span key={c} className={`text-xs font-medium px-2.5 py-1 rounded-full ${cuisineColor(c)}`}>
            {c}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        {restaurant.branches.map((b) =>
          b.mapsUrl ? (
            <a
              key={b.area}
              href={b.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors font-medium"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {b.area}
            </a>
          ) : (
            <span key={b.area} className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full font-medium">
              {b.area}
            </span>
          )
        )}
      </div>
    </div>
  );
}
