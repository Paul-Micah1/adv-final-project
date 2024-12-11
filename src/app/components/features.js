import { Search, BookOpen, Filter } from "lucide-react";

export default function Features() {
  return (
    <section className="bg-gray-100 py-12">
      <h3 className="text-2xl font-bold text-center mb-8">
        Why Choose Recipe Finder?
      </h3>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <Search className="mx-auto h-8 w-8 mb-2" />
          <h4 className="font-bold text-lg">Easy Search</h4>
          <p className="text-gray-600">
            Find recipes quickly with our powerful search feature.
          </p>
        </div>
        <div>
          <BookOpen className="mx-auto h-8 w-8 mb-2" />
          <h4 className="font-bold text-lg">Save Favorites</h4>
          <p className="text-gray-600">
            Create your personal cookbook by saving your favorite recipes.
          </p>
        </div>
        <div>
          <Filter className="mx-auto h-8 w-8 mb-2" />
          <h4 className="font-bold text-lg">Dietary Filters</h4>
          <p className="text-gray-600">
            Easily find recipes that match your dietary needs and preferences.
          </p>
        </div>
      </div>
    </section>
  );
}
