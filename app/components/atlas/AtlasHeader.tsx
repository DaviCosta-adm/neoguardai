"use client";

interface Props {
  onClose: () => void;
}

export default function AtlasHeader({ onClose }: Props) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        border-b
        border-white/10
        px-4
        py-3
      "
    >

      <div className="flex items-center gap-2.5">

        <div
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-xl
            bg-cyan-400/10
            border
            border-cyan-400/20
          "
        >

          <span
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-cyan-400
            "
          />

        </div>


        <div>

          <h2
            className="
              text-sm
              font-semibold
              text-white
            "
          >
            Atlas
          </h2>


          <p
            className="
              text-[11px]
              text-gray-400
            "
          >
            Assistente NeoGuardAI
          </p>

        </div>

      </div>


      <button
        onClick={onClose}
        className="
          text-lg
          leading-none
          text-gray-400
          transition
          hover:text-white
        "
      >
        ×
      </button>


    </div>
  );
}