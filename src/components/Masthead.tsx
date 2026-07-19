import { Masthead, MastheadTitle } from "@govtechmy/myds-react/masthead";
import { InfoIcon } from "@govtechmy/myds-react/icon";

export default function CustomMasthead() {
  return (
    <Masthead>
      <div className="px-4.5 flex items-center gap-2 overflow-x-hidden py-2 outline-none sm:py-1 md:px-6 max-w-screen-xl">
        <div className="text-txt-black-700 text-[12px] flex w-full items-center justify-between truncate sm:justify-start">
          <div className="px-1.5 pl-2 sm:pl-6 lg:pl-8">
            <InfoIcon className="inline-block text-txt-black-700" />
          </div>
          <MastheadTitle>
            This is a community project built on official open data.
          </MastheadTitle>
        </div>
      </div>
    </Masthead>
  );
}
