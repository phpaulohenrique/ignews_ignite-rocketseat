import { fireEvent, render, screen } from "@testing-library/react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { SubscribeButton } from ".";

jest.mock("next-auth/react");

jest.mock("next/router", () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
    }),
}));

describe("SubscribeButton component", () => {
    it("renders correctly", () => {
        const useSessionMocked = jest.mocked(useSession);

        useSessionMocked.mockReturnValueOnce({ data: null, status: "loading" });

        render(<SubscribeButton />);

        expect(screen.getByText("Subscribe now")).toBeInTheDocument();
    });


    it("redirect to signin when not authenticated", () => {
        const useSessionMocked = jest.mocked(useSession);
        useSessionMocked.mockReturnValueOnce({
            data: null,
            status: "authenticated",
        });

        render(<SubscribeButton />);

        const subscribeButton = screen.getByText("Subscribe now");
        fireEvent.click(subscribeButton);

        const signInMocked = jest.mocked(signIn);
        signInMocked.mockReturnValueOnce({} as any);

        expect(signInMocked).toHaveBeenCalled();
    });

    it("redirect to post when user is authenticated and had an active subscription", () => {
        const useSessionMocked = jest.mocked(useSession);
        useSessionMocked.mockReturnValueOnce({
            data: { activeSubscription: "active", expires: "expire" },
            status: "authenticated",
        });

        const router = useRouter();

        render(<SubscribeButton />);

        const subscribeButtonActive = screen.getByText("Subscribe now");
        fireEvent.click(subscribeButtonActive);

        expect(router.push).toHaveBeenCalledWith('/posts');
    });


});
