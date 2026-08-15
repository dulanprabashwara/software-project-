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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Open the Editor</h2>
              <p className="text-gray-700 mb-4">
                Click on the "Write" button located in the top navigation bar. This will take you to the editor.
              </p>
             
              <img
              src="/images/tutorials/write-an-article/header.png"
              />
            </section>

            {/* Step 2 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select Create New Article </h2>
              <p className="text-gray-700 mb-4">
                This will take you to choose the article type
               </p>
               
              <img
              src="/images/tutorials/write-an-article/createNewArticle.png"
              />
            </section>

            {/* Step 3 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Select As a Regular Article </h2>
              <p className="text-gray-700 mb-4">
                This will take you to the Article Editor
               </p>
               
              <img
              src="/images/tutorials/write-an-article/asRegularArticle.png"
              />
            </section>

            {/* Step 4 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">You are in the article editor </h2>
              <p className="text-gray-700 mb-4">
                Write your article here
               </p>
               
              <img
              src="/images/tutorials/write-an-article/articleEditor.png"
              />
            </section>

            {/* Step 4 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">To save article for later: click "Save as Draft" </h2>
              <p className="text-gray-700 mb-4">
                These can be accessed in the Unpublished Article section
               </p>
               
              <img
              src="/images/tutorials/write-an-article/saveDraft.png"
              />
            </section>

            {/* Step 5 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Before publishing click "Preview"</h2>
              <p className="text-gray-700 mb-4">
                To see how your article look like
               </p>
               
              <img
              src="/images/tutorials/write-an-article/previewArticle.png"
              />
            </section>

            {/* Step 6 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Save and Preview</h2>
              <p className="text-gray-700 mb-4">
                
               </p>
               
              <img
              src="/images/tutorials/write-an-article/saveAndPreview.png"
              />
            </section>

             {/* Step 7*/}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">This is the article preview</h2>
              <p className="text-gray-700 mb-4">
                Your article is now also saved to Drafts. Use the correct button to Exit, Publish, or to Edit.
               </p>
               
              <img
              src="/images/tutorials/write-an-article/articlePreview.png"
              />
            </section>

          </div>
        </article>

      </div>
    </div>
  );
}
