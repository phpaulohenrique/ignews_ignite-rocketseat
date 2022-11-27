import { render, screen } from "@testing-library/react"
import { getSession } from "next-auth/react";
import Post, { getServerSideProps } from "../../pages/posts/[slug]"
import { getPrismicClient} from '../../services/prismic'


const post = {
    slug: "my-new-post",
    title: "My New Post",
    content: "<p>post excerpt</p>",
    updatedAt: "10 de Abril",
};


jest.mock('../../services/prismic')
jest.mock('next-auth/react')

describe('Post page', () => {

    it('renders correctly', () => {
        render(<Post post={post}  />)

        
        expect(screen.getByText('My New Post')).toBeInTheDocument()
        expect(screen.getByText("post excerpt")).toBeInTheDocument();
        
    })


    it('redirects user if subscription is no found', async ()  => {

        const getSessionMocked = jest.mocked(getSession)
        
        getSessionMocked.mockResolvedValueOnce(null)
        
        const response = await getServerSideProps({params: {slug: 'my-new-post'}} as any)

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: "/",
                }),
            })
        );

    })

    it('loads initial data', async () => {
        const getPrismicClientMocked = jest.mocked(getPrismicClient)
        const getSessionMocked = jest.mocked(getSession);


        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [{ type: "heading", text: "My new post" }],
                    content: [{ type: "paragraph", text: "Post excerpt" }],
                },
                last_publication_date: "04-01-2021",
            }),
        } as any);

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: "fake-active-price",
        } as any)

        const response = await getServerSideProps({params: {slug: 'my-new-post'}} as any)


        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: "my-new-post",
                        title: "My new post",
                        content: "<p>Post excerpt</p>",
                        updatedAt: "01 de abril de 2021",
                    },
                },
            })
        );

    })
})