import { useEffect, useState } from 'react';
import { apiClient } from '../services/axiosConfig';
import { useConversationStore } from '../stores/conversationsStore';
import { useGuidelineChecksStore } from '../stores/guidelineChecksStore';
import { useShallow } from 'zustand/shallow';
import { PageReview } from '../types/PageReview';
import Popover from './Popover';
import ReactMarkdown from 'react-markdown';

export default () => {
  const { reviews, setConversationReviews } = useGuidelineChecksStore(
    useShallow(state => ({
      reviews: state.reviews,
      setConversationReviews: state.setConversationReviews,
    }))
  );
  const isGuidelineAlreadyProcessed = useConversationStore(state => state.selectedConversation?.design_process_task_id) ? true : false;
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingHasStarted, setProcessingHasStarted] = useState<boolean>(isGuidelineAlreadyProcessed);
  const currentlySelectedConversationId = useConversationStore(store => store.selectedConversationId);

  useEffect(() => {
    const getConversationReviews = async () => {
      if (currentlySelectedConversationId) {
        apiClient
          .get<PageReview[]>(`/conversations/conversation-reviews?conversation_id=${currentlySelectedConversationId}`)
          .then(response => {
            if (!response.data || response.data.length == 0) {
              setProcessingHasStarted(false);
              setIsProcessing(false);
              setConversationReviews([]);
              return;
            }
            setConversationReviews(response.data);
          })
          .catch(e => {
            // console.error(e);
            setProcessingHasStarted(false);
            setIsProcessing(false);
            setConversationReviews([]);
            return;
          });
      }
    };
    getConversationReviews();
  }, [currentlySelectedConversationId]);

  const checkProcessStatus = async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/conversations/process-status?conversation_id=${conversationId}`);
      if (response.status === 202 || response.status === 400) {
        setTimeout(() => checkProcessStatus(conversationId), 2000); // Poll every 2 seconds
      } else if (response.status === 200) {
        const taskId = response.data.task_id;
        await getProcessResult(taskId);
      }
    } catch (e) {
      console.error('Error checking process status', e);
    }
  };

  // Function to get the process result
  const getProcessResult = async (taskId: string) => {
    try {
      const response = await apiClient.get(`/conversations/process-result?task_id=${taskId}`);
      if (response.status === 200) {
        setConversationReviews(response.data); // Assuming the response is the file or review in JSON format
        setIsProcessing(false); // Stop showing the loading indicator
      }
    } catch (e) {
      console.error('Error fetching process result', e);
    }
  };

  const processDesign = async () => {
    if (!currentlySelectedConversationId) {
      console.error('No conversation ID found');
      return;
    }

    try {
      const response = await apiClient.get(`/conversations/process-design?conversation_id=${currentlySelectedConversationId}`);
      if (response.status === 200) {
        setProcessingHasStarted(true);
        setIsProcessing(true);

        // Start polling to check the task status
        checkProcessStatus(currentlySelectedConversationId);
      }
    } catch (e) {
      console.error('Error starting the process', e);
    }
  };

  return (
    <div className="flex h-[100%] w-full min-w-0 basis-[10%] shadow-lg shadow-black">
      <div className="flex h-[100%] w-full basis-full flex-col items-center justify-center">
        <div className="flex flex-[2%] items-center justify-center p-4 text-center text-lg font-semibold">Contract Checks</div>
        <div className="w-full basis-[88%] items-center justify-center divide-y overflow-y-auto">
          {reviews.map(review => {
            return (
              <div className="flex min-h-[24px] w-full flex-row items-center justify-evenly p-2 text-xl">
                {review.page_number}
                {review.guideline_achieved == null && review.guideline_achieved !== false && (
                  <Popover
                    trigger="click"
                    content={<ReactMarkdown>{review.review_description}</ReactMarkdown>}
                  >
                    <div
                      className="rounded-full bg-slate-500 p-2 hover:bg-darkBg4"
                      data-popover-target=""
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </Popover>
                )}
                {review.guideline_achieved && (
                  <Popover
                    trigger="click"
                    content={<ReactMarkdown>{review.review_description}</ReactMarkdown>}
                  >
                    <div
                      className="rounded-full bg-green-600 p-2 hover:bg-darkBg4"
                      data-popover-target=""
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </Popover>
                )}
                {review.guideline_achieved !== null && review.guideline_achieved === false && (
                  <Popover
                    trigger="click"
                    content={<ReactMarkdown>{review.review_description}</ReactMarkdown>}
                  >
                    <div
                      className="rounded-full bg-red-600 p-2 hover:bg-darkBg4"
                      data-popover-target=""
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </Popover>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-[10%] items-center justify-center">
          {!processingHasStarted && (
            <button
              className="flex max-h-10 items-center justify-center rounded-full bg-buttonBlack px-4 py-2 font-bold text-textSecondary transition delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-slate-900"
              onClick={processDesign}
            >
              PDAC
            </button>
          )}
          {processingHasStarted && isProcessing && (
            <div role="status">
              <svg
                aria-hidden="true"
                className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          )}
          {processingHasStarted && !isProcessing && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5Zm6.61 10.936a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                clipRule="evenodd"
              />
              <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
