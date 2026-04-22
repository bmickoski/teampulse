"use client";
import { useActionState, useState } from "react";
import { type OrganizationsActionState } from "@/lib/validations/organizations";
import { organizationsAction } from "@/lib/actions/organizations";

export default function CreateOrganizationPage() {
  const [slug, setSlug] = useState("");
  const [state, formAction] = useActionState<
    OrganizationsActionState,
    FormData
  >(organizationsAction, {});

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Organization
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Get started with your new organization
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Organization Name"
              onChange={handleNameChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {state.errors?.name && (
              <p className="mt-1.5 text-xs text-red-600">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700"
            >
              Slug
            </label>
            <input
              id="slug"
              type="text"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="Enter Slug (e.g. my-organization)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {state.errors?.slug && (
              <p className="mt-1.5 text-xs text-red-600">{state.errors.slug[0]}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
