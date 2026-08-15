"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Newspaper, FileEdit, ArrowRight } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import CreateArticleTypeModal from "../../../../components/article/CreateArticleTypeModal";

function ChooseOptionCard({
  title,
  icon: Icon,
  onClick,
  variant = "secondary",
}) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-2xl border px-6 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(15,23,42,0.10)] ${
        isPrimary
          ? "border-transparent bg-linear-to-r from-[#1ABC9C] to-[#159A80]"
          : "border-[#DCE7E4] bg-white hover:border-[#1ABC9C]"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`rounded-xl p-3 ${
            isPrimary ? "bg-white/15" : "bg-[#EAFBF6]"
          }`}
        >
          <Icon
            className={`h-6 w-6 ${isPrimary ? "text-white" : "text-[#1ABC9C]"}`}
          />
        </div>

        <div>
          <h3
            className={`text-lg font-semibold ${
              isPrimary ? "text-white" : "text-[#0F172A]"
            }`}
          >
            {title}
          </h3>
        </div>
      </div>

      <ArrowRight
        className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${
          isPrimary ? "text-white" : "text-[#1ABC9C]"
        }`}
      />
    </button>
  );
}

function UserProfileCard({ user, loading }) {
  if (loading) {
    return (
      <div className="mb-10 flex flex-col items-center">
        <div className="h-24 w-24 animate-pulse rounded-full bg-[#E2E8F0]" />
        <div className="mt-4 h-6 w-48 animate-pulse rounded bg-[#E2E8F0]" />
      </div>
    );
  }

  const displayName = (
    user?.displayName ||
    user?.username ||
    user?.name ||
    "Writer"
  ).trim();
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName,
  )}&background=1ABC9C&color=ffffff&size=160`;
  const avatarUrl =
    user?.avatarUrl || user?.profileImage || user?.avatar || fallbackAvatar;

  return (
    <div className="mb-10 flex flex-col items-center">
      <img
        src={avatarUrl}
        alt={displayName}
        className="h-24 w-24 rounded-full border-4 border-[#1ABC9C] object-cover shadow-md"
      />
      <h2 className="mt-4 text-center text-3xl font-serif font-bold text-[#111827]">
        {displayName}
      </h2>
    </div>
  );
}

function BrandBadge() {
  return (
    <div className="mb-6 inline-flex w-fit items-center gap-3 rounded-full bg-[#E8FFF8] px-4 py-2 text-sm font-medium text-[#0F766E]">
      <img
        src="/icons/logo.jpeg"
        alt="Easy Blogger"
        className="h-5 w-5 object-contain"
      />
      Start your writing journey
    </div>
  );
}

function HeroBrand() {
  return (
    <div className="mb-6 inline-flex items-center gap-4 rounded-2xl bg-white px-5 py-3 shadow-md">
      <img
        src="/icons/logo.jpeg"
        alt="Easy Blogger"
        className="h-10 w-10 object-contain"
      />
      <span className="text-2xl font-serif font-semibold text-[#1ABC9C]">
        Easy Blogger
      </span>
    </div>
  );
}

export default function ChooseMethodPage() {
  const router = useRouter();
  const { userProfile: user, profileLoading: isLoading } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const options = useMemo(
    () => [
      {
        title: "Create a New Article",
        description: "Start fresh and write a new story from the beginning.",
        icon: Newspaper,
        onClick: () => setShowCreateModal(true),
        variant: "primary",
      },
      {
        title: "Select from Unpublished",
        description: "Continue editing a saved draft or unfinished article.",
        icon: FileEdit,
        onClick: () => router.push("/write/unpublished"),
        variant: "secondary",
      },
    ],
    [router],
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F3FBF8] via-[#F8FAFC] to-[#F8FAFC] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-[#F8FAFC] shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-10 sm:px-12 lg:px-14">
            <BrandBadge />

            <UserProfileCard user={user} loading={isLoading} />

            <p className="mb-8 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg">
              Start a brand new article or continue from one of your unpublished
              drafts.
            </p>

            <div className="grid gap-4">
              {options.map((option) => (
                <ChooseOptionCard
                  key={option.title}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  onClick={option.onClick}
                  variant={option.variant}
                />
              ))}
            </div>
          </div>

          <div className="relative hidden items-center justify-center overflow-hidden bg-[#F0FDF9] lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(26,188,156,0.18),transparent_65%)]" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#1ABC9C]/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[#0EA5E9]/10 blur-3xl" />

            <div className="relative z-10 max-w-md px-10 text-[#0F172A]">
              <HeroBrand />

              <h3 className="mb-4 text-3xl font-bold leading-tight">
                Turn your ideas into impactful articles
              </h3>

              <p className="mb-8 leading-7 text-[#475569]">
                Write confidently, continue drafts easily, and manage your
                content in a cleaner and more professional workflow.
              </p>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-[#64748B]">
                    New Article
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#0F172A]">
                    Start writing from scratch
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-[#64748B]">
                    Unpublished Drafts
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#0F172A]">
                    Resume your saved progress anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateArticleTypeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUseAi={() => router.push("/ai-generate")}
        onRegular={() => router.push("/write/create")}
      />
    </div>
  );
}
