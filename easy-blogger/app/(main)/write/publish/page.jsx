"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useClearBackupOnLayoutNavigation } from "../../../../hooks/articles/useClearBackupOnLayoutNavigation";
import { usePublishArticle } from "../../../../hooks/articles/usePublishArticle";
import {
  TagSection,
  TimingSection,
  SocialSharingSection,
  LinkedInCaptionSection,
} from "./PublishSections";

export default function PublishArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const articleId = searchParams.get("id") || "";
  const mode = searchParams.get("mode") || "";

  // Ensures stale article backups are cleared when navigating away from the workflow
  useClearBackupOnLayoutNavigation({
    mode,
    articleId,
  });

  // Centralizes all publishing state and business logic to keep the UI component clean
  const { state, actions } = usePublishArticle(articleId);

  useEffect(() => {
    // Closes date/time pickers when clicking outside to ensure a smooth, non-intrusive UX
    const handleOutsideClick = (event) => {
      if (!event.target.closest?.("[data-picker]")) {
        actions.setDateOpen(false);
        actions.setTimeOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [actions]);

  if (state.isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-emerald-50 p-6">
        <p className="text-sm text-gray-500">Loading publish details...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-white to-emerald-50 p-6">
      <div className="w-full max-w-2xl rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="p-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-[#111827]">
            Publish your Article
          </h1>
          <p className="mt-1 text-[#6B7280]">
            You can publish now or schedule a time to publish
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        <TagSection
          tagInput={state.tagInput}
          setTagInput={actions.setTagInput}
          tags={state.tags}
          setTags={actions.setTags}
          addTag={actions.addTag}
          removeTag={actions.removeTag}
          MAX_TAGS={state.MAX_TAGS}
        />

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        <TimingSection
          timing={state.timing}
          setTiming={actions.setTiming}
          scheduledDate={state.scheduledDate}
          setScheduledDate={actions.setScheduledDate}
          scheduledTime={state.scheduledTime}
          setScheduledTime={actions.setScheduledTime}
          dateOpen={state.dateOpen}
          setDateOpen={actions.setDateOpen}
          timeOpen={state.timeOpen}
          setTimeOpen={actions.setTimeOpen}
          tpHour={state.tpHour}
          setTpHour={actions.setTpHour}
          tpMinute={state.tpMinute}
          setTpMinute={actions.setTpMinute}
          tpPeriod={state.tpPeriod}
          setTpPeriod={actions.setTpPeriod}
          isPastDateTime={actions.isPastDateTime}
        />

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        <SocialSharingSection
          shareLinkedIn={state.shareLinkedIn}
          setShareLinkedIn={actions.setShareLinkedIn}
          shareWordPress={state.shareWordPress}
          setShareWordPress={actions.setShareWordPress}
          setWpCheckDone={actions.setWpCheckDone}
          wpCheckDone={state.wpCheckDone}
          wpConnected={state.wpConnected}
          wpUsername={state.wpUsername}
          wpPublishError={state.wpPublishError}
          setLiCheckDone={actions.setLiCheckDone}
          liCheckDone={state.liCheckDone}
          liConnected={state.liConnected}
          liUsername={state.liUsername}
          showShareText={state.showShareText}
          shareText={state.shareText}
        />

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        <LinkedInCaptionSection
          shareLinkedIn={state.shareLinkedIn}
          linkedinCaption={state.linkedinCaption}
          setLinkedinCaption={actions.setLinkedinCaption}
        />

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        {state.publishError ? (
          <div className="px-10 pb-2 pt-4">
            <p className="text-sm text-red-500">{state.publishError}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-40 p-8">
          <button
            type="button"
            data-keep-edit-backup="true"
            onClick={() => router.back()}
            className="rounded-full bg-black px-8 py-3 text-white transition-colors hover:bg-gray-800"
          >
            Back
          </button>

          <button
            type="button"
            data-keep-edit-backup="true"
            onClick={actions.handlePublishArticle}
            disabled={state.isSubmitting || (state.timing === "schedule" && actions.isPastDateTime())}
            className={`rounded-full px-8 py-3 text-white transition-all ${
              state.isSubmitting || (state.timing === "schedule" && actions.isPastDateTime())
                ? "cursor-not-allowed bg-gray-400"
                : "bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg"
            }`}
          >
            {state.isSubmitting
              ? "Processing..."
              : state.timing === "schedule"
                ? "Schedule post"
                : "Publish now"}
          </button>
        </div>
      </div>
    </div>
  );
}