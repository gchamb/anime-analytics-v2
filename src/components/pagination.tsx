"use client";
import { createQueryString } from "@/lib/utils";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

type PaginationProps = {
  page: number;
  totalPages: number;
  nextPage?: () => void;
  prevPage?: () => void;
  className?: string;
};

export default function Pagination({
  page,
  totalPages,
  nextPage,
  prevPage,
  className,
}: PaginationProps) {
  const router = useRouter();
  return (
    <div
      className={`justify-self-center flex gap-x-2  text-center items-center pb-2 ${className}`}
    >
      {page > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const res = prevPage?.();

            if (res === undefined) {
              const url = createQueryString({ page: `${page - 1}` });
              router.push(url);
            }
          }}
          disabled={page === 1}
        >
          Prev
        </Button>
      )}

      <span>{`${page} of ${totalPages}`}</span>

      {page !== totalPages && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const res = nextPage?.();

            if (res === undefined) {
              const url = createQueryString({ page: `${page + 1}` });
              router.push(url);
            }
          }}
          disabled={page === totalPages}
        >
          Next
        </Button>
      )}
    </div>
  );
}
