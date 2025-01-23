import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '../services/axiosConfig';
import { useAuthStore } from '../stores/authStore';
import { useConversationStore } from '../stores/conversationsStore';
import { useUIStore } from '../stores/uiStore';
import { useGuidelineChecksStore } from '../stores/guidelineChecksStore';
import { useShallow } from 'zustand/react/shallow';
import { Message } from '../types/Message';
import { PageReview } from '../types/PageReview';
import { IoCreateOutline, IoChevronForwardOutline, IoChevronDownOutline } from 'react-icons/io5';
import { DarkModeToggle } from './DarkModeToggle';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import ReactMarkdown from 'react-markdown';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export default function LeftLayout() {
  const { userId } = useAuthStore(useShallow(state => ({ userId: state.user_id })));
  const {
    allUserConversations,
    selectedConversationId,
    setCurrentConversationId,
    setAllUserConversations,
    setCurrentConversationMessages,
    createNewConversation,
  } = useConversationStore(
    useShallow(state => ({
      selectedConversationId: state.selectedConversationId,
      allUserConversations: state.allUserConversations,
      setCurrentConversationId: state.setSelectedConversationId,
      setCurrentConversationMessages: state.setSelectedConversationMessages,
      setAllUserConversations: state.setAllUserConversations,
      createNewConversation: state.createNewConversation,
    }))
  );

  const { reviews, setConversationReviews } = useGuidelineChecksStore(
    useShallow(state => ({
      reviews: state.reviews,
      setConversationReviews: state.setConversationReviews,
    }))
  );

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingHasStarted, setProcessingHasStarted] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  
  const conversationsWithIcons = useMemo(() => {
    return allUserConversations.map(conversation => ({
      ...conversation,
      iconSeed: conversation.iconSeed || conversation.id || Math.random().toString(36).substring(7)
    }));
  }, [allUserConversations]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (userId) {
      apiClient
        .get(`/conversations?user_id=${userId}`)
        .then(response => setAllUserConversations(response.data))
        .catch(console.error);
    }
  }, [userId]);

  useEffect(() => {
    if (selectedConversationId) {
      apiClient
        .get<PageReview[]>(`/conversations/conversation-reviews?conversation_id=${selectedConversationId}`)
        .then(response => {
          if (!response.data || response.data.length === 0) {
            setProcessingHasStarted(false);
            setIsProcessing(false);
            setConversationReviews([]);
            return;
          }
          setConversationReviews(response.data);
          setProcessingHasStarted(true);
        })
        .catch(e => {
          console.error(e);
          setProcessingHasStarted(false);
          setIsProcessing(false);
          setConversationReviews([]);
        });
    }
  }, [selectedConversationId]);

  const checkProcessStatus = async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/conversations/process-status?conversation_id=${conversationId}`);
      if (response.status === 202 || response.status === 400) {
        setTimeout(() => checkProcessStatus(conversationId), 2000);
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

  const getProcessResult = async (taskId: string) => {
    try {
      const response = await apiClient.get(`/conversations/process-result?task_id=${taskId}`);
      if (response.status === 200) {
        setConversationReviews(response.data);
        setIsProcessing(false);
      }
    } catch (e) {
      console.error('Error fetching process result', e);
      setIsProcessing(false);
    }
  };

  const processDesign = async () => {
    if (!selectedConversationId) {
      console.error('No conversation ID found');
      return;
    }

    try {
      const response = await apiClient.get(`/conversations/process-design?conversation_id=${selectedConversationId}`);
      if (response.status === 200) {
        setProcessingHasStarted(true);
        setIsProcessing(true);
        checkProcessStatus(selectedConversationId);
      }
    } catch (e) {
      console.error('Error starting the process', e);
    }
  };

  const loadConversation = async (selectedConversationId: string | undefined) => {
    if (!selectedConversationId) return;
    setCurrentConversationId(selectedConversationId);
    const messages = await apiClient.get(`/conversations/conversation-messages?conversation_id=${selectedConversationId}`);
    setCurrentConversationMessages(messages.data.map((message: Message) => ({ ...message, isStreaming: false })));
  };

  const { isSidebarExpanded, expandedSections, toggleSection, toggleSidebar } = useUIStore(
    useShallow(state => ({
      isSidebarExpanded: state.isSidebarExpanded,
      expandedSections: state.expandedSections,
      toggleSection: state.toggleSection,
      toggleSidebar: state.toggleSidebar,
    }))
  );

  return (
    <>
      {/* Backdrop overlay for mobile only */}
      {isSidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity md:hidden" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      <Card className="flex h-full flex-col bg-card text-card-foreground shadow-xl transition-all duration-300">
        <div className={`relative flex flex-col overflow-hidden ${
          isSidebarExpanded ? 'h-full' : 'h-0 md:h-full'
        } w-full bg-card`}>
          {/* Header */}
          <div className="flex-none p-1">
            <div className="flex items-center justify-between p-1">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-medium">Menu</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={createNewConversation}
                    aria-label="Create New Conversation"
                    className="h-7 w-7 rounded-lg p-0"
                  >
                    <IoCreateOutline className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <DarkModeToggle />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="flex h-full flex-col p-0.5">
              {/* Conversations Section */}
              <Collapsible
                open={expandedSections.includes('conversations')}
                onOpenChange={() => toggleSection('conversations')}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-between px-1 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    <span className={`${isSidebarExpanded ? 'block md:block' : 'hidden md:block'} truncate`}>Conversations</span>
                    {(isSidebarExpanded || isDesktop) && (
                      expandedSections.includes('conversations') ? (
                        <IoChevronDownOutline className="h-3.5 w-3.5" />
                      ) : (
                        <IoChevronForwardOutline className="h-3.5 w-3.5" />
                      )
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-0.5 py-0.5">
                    {allUserConversations.length > 0 && (
                      <ul className="space-y-1">
                        {conversationsWithIcons.map(conversation => (
                          <li key={conversation.id}>
                            <Button
                              variant={conversation.id === selectedConversationId ? "secondary" : "ghost"}
                              className={`relative w-full p-1.5 text-[10px] transition-all hover:pl-9 ${
                                conversation.id === selectedConversationId 
                                  ? 'text-foreground font-medium' 
                                  : 'text-muted-foreground opacity-75 hover:opacity-90'
                              }`}
                              onClick={() => loadConversation(conversation.id)}
                            >
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-75">
                                <img 
                                  src={`https://api.dicebear.com/7.x/shapes/svg?seed=${conversation.iconSeed}`}
                                  alt=""
                                  className="w-full h-full"
                                />
                              </div>
                              <span className={`${isSidebarExpanded ? 'block' : 'hidden'} md:block w-full truncate pl-6 text-left`}>
                                {conversation.thumbnail_text}
                              </span>
                              <span className={`${isSidebarExpanded ? 'hidden' : 'block'} md:hidden mx-auto text-muted-foreground/60`}>
                                •
                              </span>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Files Section */}
              <Collapsible
                open={expandedSections.includes('files')}
                onOpenChange={() => toggleSection('files')}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-between px-1 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    <span className={`${isSidebarExpanded ? 'block md:block' : 'hidden md:block'} truncate`}>Guidelines</span>
                    {(isSidebarExpanded || isDesktop) && (
                      expandedSections.includes('files') ? (
                        <IoChevronDownOutline className="h-3.5 w-3.5" />
                      ) : (
                        <IoChevronForwardOutline className="h-3.5 w-3.5" />
                      )
                    )}
                  </Button>
                </CollapsibleTrigger>
                {(isSidebarExpanded || isDesktop) && reviews.length > 0 && (
                  <div className="mt-1 px-2">
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1">
                      <span className="text-xs text-muted-foreground">Compliance Score:</span>
                      <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        (reviews.filter(r => r.guideline_achieved === true).length / reviews.length) * 100 >= 70
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {((reviews.filter(r => r.guideline_achieved === true).length / reviews.length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
                <CollapsibleContent>
                  <div className="space-y-1 px-0.5 py-0.5">
                    {(isSidebarExpanded || isDesktop) && (
                      <>
              <div className="space-y-1 px-0.5 py-0.5">
                {reviews
                  .sort((a, b) => a.page_number - b.page_number)
                  .map(review => (
                    <div
                      className="mb-2 flex items-center justify-between rounded-md bg-muted p-2 text-xs text-muted-foreground transition-all duration-300 hover:bg-muted/80"
                      key={review.page_number}
                    >
                      <span className="font-mono text-sm">Page {review.page_number}</span>
                      <Tippy
                        content={<ReactMarkdown>{review.review_description}</ReactMarkdown>}
                        arrow={true}
                        className="rounded-md bg-popover p-2 text-popover-foreground shadow-md"
                        placement="right"
                      >
                        <div 
                          className={`rounded-full p-2 transition duration-300 ease-in-out ${
                            review.guideline_achieved == null && review.guideline_achieved !== false
                              ? 'bg-muted/80 hover:bg-muted'
                              : review.guideline_achieved
                                ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50'
                                : 'bg-destructive/20 hover:bg-destructive/30'
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="h-4 w-4"
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
                {!processingHasStarted && (
                  <Button
                    onClick={processDesign}
                    className="relative mt-2 w-full"
                    variant="secondary"
                    size="sm"
                  >
                    <span className="relative z-10 flex items-center justify-center text-xs font-medium">
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
                  </Button>
                )}
                {processingHasStarted && isProcessing && (
                  <div role="status" className="flex items-center justify-center">
                    <svg
                      aria-hidden="true"
                      className="h-8 w-8 animate-spin text-muted-foreground"
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
                      className="h-8 w-8 transform text-muted-foreground transition-all duration-300 hover:scale-110"
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
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        </div>
      </Card>
    </>
  );
}
