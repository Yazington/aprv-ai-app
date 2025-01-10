import { useEffect, useState } from 'react';
import { apiClient } from '../services/axiosConfig';
import { useConversationStore } from '../stores/conversationsStore';
import { useGuidelineChecksStore } from '../stores/guidelineChecksStore';
import { useShallow } from 'zustand/shallow';
import { PageReview } from '../types/PageReview';
import ReactMarkdown from 'react-markdown';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

// Define functional component
export default () => {
  const { reviews, setConversationReviews } = useGuidelineChecksStore(
    useShallow(state => ({
      reviews: state.reviews,
      setConversationReviews: state.setConversationReviews,
    }))
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const currentlySelectedConversationId = useConversationStore(store => store.selectedConversationId);
  const isGuidelineAlreadyProcessed = useConversationStore(state => state.selectedConversation) ? true : false;
  const [processingHasStarted, setProcessingHasStarted] = useState<boolean>(isGuidelineAlreadyProcessed);

  // Fetch reviews
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
            console.error(e);
            setProcessingHasStarted(false);
            setIsProcessing(false);
            setConversationReviews([]);
            return;
          });
      }
    };
    getConversationReviews();
    setProcessingHasStarted(isGuidelineAlreadyProcessed);
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
      setIsProcessing(false);
      setProcessingHasStarted(false);
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
      setIsProcessing(false);
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

  const IconStyles = {
    base: 'rounded-full p-2 transition duration-300 ease-in-out',
    alert: 'bg-lightBg4/70 hover:bg-lightBg4/90 dark:bg-darkBg4/70 dark:hover:bg-darkBg4/90',
    success: 'bg-lightBg4/70 hover:bg-lightBg4/90 dark:bg-darkBg4/70 dark:hover:bg-darkBg4/90',
    error: 'bg-lightBg4/70 hover:bg-lightBg4/90 dark:bg-darkBg4/70 dark:hover:bg-darkBg4/90',
    svgStyles: 'h-4 w-4',
  };
  // Render component
  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="flex h-full flex-col space-y-4">
        <div className="bg-lightBg2/90 mb-2 flex items-center justify-between rounded-lg p-3 backdrop-blur-sm dark:bg-darkBg2/80">
          <h2 className="text-base font-semibold text-textPrimary dark:text-textSecondary">Guidelines</h2>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto rounded-lg bg-darkBg3/30 p-2 backdrop-blur-sm">
          {reviews
            .sort((a, b) => a.page_number - b.page_number) // Sort by page_number
            .map(review => (
              <div
                className="bg-lightBg3/50 hover:bg-lightBg4/50 flex items-center justify-between rounded-md p-2 text-xs text-textSecondary transition-all duration-300 dark:bg-darkBg3/50 dark:text-textTert dark:hover:bg-darkBg4/50"
                key={review.page_number}
              >
                <span className="font-mono text-sm text-textTert dark:text-textSecondary">Page {review.page_number}</span>
                <Tippy
                  content={<ReactMarkdown>{review.review_description}</ReactMarkdown>}
                  arrow={true}
                  className="bg-darkBg3"
                  placement="right"
                >
                  <div
                    className={`${IconStyles.base} ${
                      review.guideline_achieved == null && review.guideline_achieved !== false
                        ? IconStyles.alert
                        : review.guideline_achieved
                          ? IconStyles.success
                          : IconStyles.error
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className={IconStyles.svgStyles}
                    >
                      {review.guideline_achieved == null && review.guideline_achieved !== false && (
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                          clipRule="evenodd"
                        />
                      )}
                      {review.guideline_achieved && (
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                          clipRule="evenodd"
                        />
                      )}
                      {review.guideline_achieved !== null && review.guideline_achieved === false && (
                        <path
                          fillRule="evenodd"
                          d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                  </div>
                </Tippy>
              </div>
            ))}
        </div>
        <div className="flex flex-shrink-0 items-center justify-center py-2">
          {!processingHasStarted && (
            <button
              onClick={processDesign}
              className="bg-lightBg4/90 group relative mt-2 w-full overflow-hidden rounded-lg p-[1px] transition-all duration-300 hover:scale-[1.02] dark:bg-darkBg4/90"
            >
              <div className="bg-lightBg2/90 relative rounded-lg px-4 py-2 transition-all duration-300 group-hover:bg-opacity-90 dark:bg-darkBg2/90">
                <span className="relative z-10 flex items-center justify-center text-xs font-medium text-textPrimary dark:text-textSecondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  Run Compliance Check
                </span>
              </div>
            </button>
          )}
          {processingHasStarted && isProcessing && (
            <div role="status">
              <svg
                aria-hidden="true"
                className="h-8 w-8 animate-spin text-textPrimary dark:text-textSecondary"
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
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8 transform text-textPrimary transition-all duration-300 hover:scale-110 hover:text-textSecondary dark:text-textSecondary dark:hover:text-textTert"
              >
                <path
                  fillRule="evenodd"
                  d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5Zm6.61 10.936a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
