import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';
import Post from '../../pages/posts/preview/[slug]';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { getStaticProps } from '../../pages';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');
jest.mock('next/router');

const post = { 
  slug: 'my-new-post', 
  title: 'My new post', 
  content: '<p>Post content</p>', 
  updatedAt: 'April 02, 2021' 
};

describe('Post preview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render (
      <Post post={post} />
    )

    expect(screen.getByText('My new post')).toBeInTheDocument()
    expect(screen.getByText('Post content')).toBeInTheDocument()
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
  });

  it('redirects user to full post when subscribed', async () => {
    const useSessionMocked = mocked(useSession)
    const useRouterMocked = mocked(useRouter)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: 'fake-active-subscription' }, 
      false
    ] as any)

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any)

    render(<Post post={post} />)

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My new post' }
          ],
          content: [
            { type: 'paragraph', text: 'Post content' }
          ],
        },
        last_publication_date: '04-02-2021',
      })
    } as any)

    const response = await getStaticProps({
      params: { slug: 'my-new-post' }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post', 
            title: 'My new post', 
            content: '<p>Post content</p>', 
            updatedAt: 'April 02, 2021'
          }
        }
      })
    )
  });
})