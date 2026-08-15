import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <Link 
          href="/help"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#1ABC9C] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help
        </Link>

        <article className="prose prose-emerald lg:prose-lg mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 font-serif mb-6">
            How to Write an Article
          </h1>
          
          <p className="text-gray-600 mb-10 text-lg">
            This tutorial will guide you through the process of writing and publishing an article on Easy Blogger.
          </p>

          <div className="space-y-12">
            
            {/* Step 1 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Step 1: Open the Editor</h2>
              <p className="text-gray-700 mb-4">
                Click on the "Write" button located in the top navigation bar. This will take you to the editor.
              </p>
              {/* Placeholder for Image */}
              <div className="w-full h-64 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                [Insert Picture: Header with Write button highlighted]
              </div>
            </section>

            {/* Step 2 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Step 2: Add Title and Content</h2>
              <p className="text-gray-700 mb-4">
                Start by typing your title in the big text field. Then, click below it to start writing your content. You can use the formatting tools to make your text look great.
              </p>
              {/* Placeholder for Image */}
              <div className="w-full h-64 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                [Insert Picture: Editor with title and text]
              </div>
            </section>

            {/* Step 3 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Step 3: Publish Your Article</h2>
              <p className="text-gray-700 mb-4">
                Once you are happy with your article, click the "Publish" button at the top right of the editor. You can also add tags to help people find your article.
              </p>
              {/* Placeholder for Image */}
              <div className="w-full h-64 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
                [Insert Picture: Publish modal with tags]
              </div>
            </section>

          </div>
        </article>

      </div>
    </div>
  );
}
