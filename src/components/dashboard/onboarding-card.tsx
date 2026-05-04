import { CheckCircle } from "lucide-react";

type Props = {
  hasPulse: boolean;
  hasMember: boolean;
  onDismiss: () => void;
};

export function OnboardingCard({ hasPulse, hasMember, onDismiss }: Props) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">
          Get started with TeamPulse
        </h2>
        <button
          onClick={onDismiss}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Skip
        </button>
      </div>

      <ul className="space-y-2">
        <li className="flex items-center gap-2 text-sm">
          <CheckCircle
            size={16}
            className={hasPulse ? "text-indigo-600" : "text-gray-300"}
          />
          <span
            className={
              hasPulse ? "text-gray-400 line-through" : "text-gray-700"
            }
          >
            Create your first pulse
          </span>
        </li>
        <li className="flex items-center gap-2 text-sm">
          <CheckCircle
            size={16}
            className={hasMember ? "text-indigo-600" : "text-gray-300"}
          />
          <span
            className={
              hasMember ? "text-gray-400 line-through" : "text-gray-700"
            }
          >
            Invite member
          </span>
        </li>
      </ul>
    </div>
  );
}
