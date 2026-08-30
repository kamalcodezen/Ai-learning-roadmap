import { ReactNode } from "react";

interface CheckoutWrapperProps {
  children: ReactNode;
  priceId?: string;
  onClick?: () => void;
}

export default function CheckoutWrapper({ children, priceId, onClick }: CheckoutWrapperProps) {
  // Free tier or contact plan bypasses Stripe checkout submit action
  if (!priceId) {
    return (
      <button type="button" onClick={onClick} className="w-full flex justify-center">
        {children}
      </button>
    );
  }

  return (
    <form action="/api/checkout_sessions" method="POST" className="w-full flex justify-center">
      <input type="hidden" name="priceId" value={priceId} />
      <button type="submit" className="w-full flex justify-center">
        {children}
      </button>
    </form>
  );
}