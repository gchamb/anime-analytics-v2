import { Button } from "./ui/button";

type PaginationProps = {
	page: number;
	totalPages: number;
	nextPage: () => void;
	prevPage: () => void;
	className?: string;
};

export default function Pagination({ page, totalPages, nextPage, prevPage, className }: PaginationProps) {
	return (
		<div className={`justify-self-center flex gap-x-2  text-center items-center pb-2 ${className}`}>
			{page > 1 && (
				<Button variant="ghost" size="sm" onClick={prevPage} disabled={page === 1}>
					Prev
				</Button>
			)}

			<span>{`${page} of ${totalPages}`}</span>

			{page !== totalPages && (
				<Button variant="ghost" size="sm" onClick={nextPage} disabled={page === totalPages}>
					Next
				</Button>
			)}
		</div>
	);
}
