import { Footer, SiteInfo, FooterSection } from "@govtechmy/myds-react/footer";
import { Link } from "@govtechmy/myds-react/link";

export default function FooterBar() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return (
    <Footer className="mt-auto pt-10 pb-12 bg-transparent border-t border-otl-gray-200/50 dark:border-gray-800/50">
      <FooterSection className="flex flex-col md:flex-row justify-between items-center w-full py-0 border-none gap-8">
        <SiteInfo>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Link
              href="https://github.com/dataryder"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Github link"
              underline="none"
              className="flex items-center gap-2.5 group"
            >
              <img
                src="https://avatars.githubusercontent.com/u/205435790?s=200&v=4"
                width={28}
                height={28}
                alt="logo"
                loading="lazy"
                className="rounded-full select-none grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"
              />
              <span className="font-bold text-sm text-txt-black-500 dark:text-gray-500 group-hover:text-txt-black-900 dark:group-hover:text-white transition-colors">
                DataRyder
              </span>
            </Link>

            <span className="hidden md:block w-1 h-1 rounded-full bg-otl-gray-300 dark:bg-gray-700"></span>

            <p className="text-[11px] font-bold text-txt-black-400 dark:text-gray-500 text-center tracking-widest uppercase">
              Sourced from{" "}
              <Link
                href="https://pricecatcher.kpdn.gov.my/"
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                className="text-txt-black-600 dark:text-gray-300 hover:text-txt-black-900 dark:hover:text-white transition-colors"
              >
                KPDN
              </Link>{" "}
              via{" "}
              <Link
                href="https://data.gov.my/"
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                className="text-txt-black-600 dark:text-gray-300 hover:text-txt-black-900 dark:hover:text-white transition-colors"
              >
                data.gov.my
              </Link>
            </p>
          </div>
        </SiteInfo>

        <div className="flex flex-col items-center md:items-end text-txt-black-400 dark:text-gray-500 text-xs gap-1.5 font-medium tracking-tight">
          <p className="font-bold text-txt-black-900 dark:text-white">
            OpenPriceCatcher © {new Date().getFullYear()}
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">
            Last Sync:{" "}
            {d.toLocaleDateString("en-MY", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </FooterSection>
    </Footer>
  );
}
