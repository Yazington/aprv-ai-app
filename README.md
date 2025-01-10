# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react';

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
});
```

DOCKER:

```
docker build -t my-vite-app --build-arg VITE_APRV_AI_API_URL=http://localhost:9000 .
docker run -p 8081:80 my-vite-app
```

This is a Chat app between licensee/licensor and an LLM. The purpose is to help with brand guidelines and approval process.
For example, a graphic design can use this app to upload an image and evaluate the image against a whole guidelines document (100 pages or more).
Instead of doing it manually, the LLM does it by using an approval process (implemented on the backend).
This is the frontend application

## File Explanations

### TypeScript Files (.tsx)

**src/App.tsx**:
The src/App.tsx file serves as the main entry point for the React application. It integrates various components and manages the authentication state of the user. Here are the key features and functionalities of this file:

Imports:

The file imports necessary modules and components, including GoogleLogin for Google authentication, various components like Chat, ContractChecks, and Upload, as well as styles from index.css and an API client from axiosConfig.
State Management:

It utilizes a custom hook useAuthStore to manage authentication state, including access tokens, expiration, and user login status.
Effect Hooks:

The useEffect hooks are used to:
Add a 'dark' class to the document's root element for dark mode.
Update the login status based on the token's expiration.
Check if the user is logged in based on the presence of an access token.
Authentication Handling:

The handleSuccess function processes the authentication response from Google. It sends the received token to the server for validation and retrieves a new access token, expiration time, and user ID.
If the login is successful, it updates the authentication state; otherwise, it logs the user out and handles errors appropriately.
Conditional Rendering:

The component conditionally renders either the Google login button or the main application interface (which includes the Upload, Chat, and ContractChecks components) based on the user's login status.

**src/components/Chat.tsx**:
he src/components/Chat.tsx file defines the Chat component, which is responsible for managing user conversations and streaming responses from a server. Here are the key features and functionalities of this component:

Imports:

The component imports necessary hooks and components, including InputSection for user input, PreviousMessages for displaying chat history, and the apiClient for making API requests.
State Management:

It utilizes Zustand for state management through the useConversationStore and useAuthStore hooks, allowing it to manage conversation data and user authentication state.
Effect Hooks:

The component uses useEffect to fetch the selected conversation from the server whenever the selectedConversationId changes. It also cleans up the event source when the component unmounts.
Event Streaming:

The component establishes a connection to the server using EventSource to stream responses. It handles incoming messages and errors through dedicated event handlers.
The getModelResponseAndStreamTokens function sends user input to the server and sets up the event source for streaming responses.
Message Handling:

The handleSend function processes user input, adds it to the conversation, and triggers the response streaming.
The component also manages the state of the conversation, including marking messages as complete and handling tool usage notifications.
Rendering:

The component renders the chat interface, including previous messages and an input section for user interaction.
**src/components/CodeBlock.tsx**:
The src/components/CodeBlock.tsx file defines the CodeBlock component, which is responsible for rendering code snippets with proper syntax highlighting. Here are the key features and functionalities of this component:

Imports:

The component imports various utilities and types from the @llm-ui/code and shiki libraries, which are used for syntax highlighting and rendering code blocks.
It also imports parseHtml from html-react-parser to convert HTML strings into React components.
Highlighter Initialization:

The highlighter is initialized using the loadHighlighter function, which configures the highlighter with available languages, themes, and WASM support. This allows the component to highlight code snippets in various programming languages.
Code to HTML Options:

The codeToHtmlOptions object specifies the theme to be used for syntax highlighting, in this case, 'github-dark'.
Rendering Logic:

The CodeBlock component takes a blockMatch prop, which contains the output of a markdown code block.
It uses the useCodeBlockToHtml hook to convert the markdown code block into HTML with syntax highlighting.
If the HTML is not available (e.g., if the highlighter has not loaded yet), it falls back to rendering a <pre> element with the raw code.
Output:

The component returns the highlighted code as HTML, allowing it to be rendered within the application seamlessly.
**src/components/ContractChecks.tsx**:
The src/components/ContractChecks.tsx file defines a component that manages guideline checks for conversations. Here are the key features and functionalities of this component:

Imports:

The component imports various hooks and libraries, including ReactMarkdown for rendering markdown content, Tippy for tooltips, and the apiClient for making API requests.
State Management:

It uses Zustand for state management through the useGuidelineChecksStore and useConversationStore hooks, allowing it to manage reviews and conversation data.
Effect Hooks:

The useEffect hook fetches conversation reviews from the server whenever the selected conversation ID changes. It updates the state with the fetched reviews or handles errors appropriately.
Processing Logic:

The component includes functions to start processing design checks (processDesign), check the status of the processing (checkProcessStatus), and retrieve the results of the processing (getProcessResult).
It polls the server every 2 seconds to check the status of the processing task and updates the state accordingly.
Rendering Logic:

The component renders a list of reviews, displaying the page number and a tooltip with the review description. It uses different styles to indicate whether guidelines were achieved, in progress, or failed.
A button is provided to initiate the compliance check, and loading indicators are shown during processing.
Styling:

The component uses Tailwind CSS classes for styling, ensuring a responsive and visually appealing layout.
**src/components/CustomFileUploader.tsx**:
The src/components/CustomFileUploader.tsx file defines a CustomFileUploader component that provides a user-friendly interface for file uploads. Here are the key features and functionalities of this component:

Imports:

The component imports React hooks, FontAwesome icons for visual representation, and specific icons for the upload button.
Props Interface:

The CustomFileUploaderProps interface defines the expected props for the component, including:
handleChange: A function to handle the file selection.
multiple: A boolean indicating if multiple files can be uploaded.
name: The name attribute for the file input.
types: An array of accepted file types.
className: Additional CSS classes for styling.
State Management:

The component uses the useRef hook to reference the file input element and the useState hook to manage the drag-and-drop state.
Drag-and-Drop Functionality:

The component implements drag-and-drop functionality with event handlers for:
onDragOver: Activates the drag state.
onDragLeave: Deactivates the drag state.
onDrop: Handles file drops and invokes the handleChange function with the dropped files.
File Input Handling:

The onButtonClick function triggers a click on the hidden file input when the user clicks on the uploader area.
The onFileChange function handles file selection through the file input and invokes the handleChange function with the selected files.
Accepted File Types:

The component constructs a string of accepted file types based on the types prop, which is used in the file input's accept attribute.
Rendering:

The component renders a div that acts as the uploader area, displaying an upload icon. The appearance changes based on the drag-and-drop state.
**src/components/GlowingText.tsx**:
The src/components/GlowingText.tsx file defines a ReflectingText component that displays text with a glowing effect. Here are the key features and functionalities of this component:

Imports:

The component imports React to create a functional component.
Props Interface:

The component accepts a single prop, text, which can be a string or undefined. This prop represents the text to be displayed.
Container Styles:

The containerStyles object defines the CSS styles for the text, including:
fontSize: Set to 18px for the text size.
fontWeight: Bold text.
background: A linear gradient that creates a glowing effect.
backgroundSize: Set to 200% to allow for animation.
WebkitBackgroundClip and WebkitTextFillColor: Used to create the text fill effect with the gradient.
animation: Applies a smooth animation to the background.
textAlign: Centers the text.
display: Inline-block to allow for padding and centering.
padding: Adds spacing around the text.
boxShadow: Adds a subtle shadow for depth.
Animation:

The component includes a <style> tag that defines a keyframe animation named reflect. This animation changes the background position over time, creating a smooth glowing effect.
Rendering:

The component renders a <div> with the defined styles, displaying the provided text.
**src/components/InputSection.tsx**:
The src/components/InputSection.tsx file defines the InputSection component, which manages user input for sending messages. Here are the key features and functionalities of this component:

Imports:

The component imports React and its hooks for managing state and effects.
Props Interface:

The Props interface defines the expected props for the component, including:
input: The current input value (string or undefined).
setInput: A function to update the input value.
handleSend: A function to handle sending the message.
State Management:

The component uses the useRef hook to reference the input element and the useState hook to manage whether the input is not empty.
Effect Hook:

The useEffect hook adjusts the height of the input field based on its content. It also checks if the input is not empty and updates the state accordingly.
Input Change Handling:

The handleInputChange function updates the input value and adjusts the height of the input field dynamically as the user types.
Rendering Logic:

The component renders a text input field for user messages and a button to send the message.
The button displays an SVG icon that changes based on whether the input is empty or not. If the input is not empty, it shows an up arrow; otherwise, it shows a checkmark.
Keyboard Handling:

The component listens for the Enter key press to send the message, preventing the default behavior if the Shift key is not held down.
Styling:

The component uses Tailwind CSS classes for styling, ensuring a responsive and visually appealing layout.
**src/components/MarkdownComponent.tsx**:
The src/components/MarkdownComponent.tsx file defines a MarkdownComponent that renders markdown content. Here are the key features and functionalities of this component:

Imports:

The component imports ReactMarkdown from the react-markdown library, which is used to convert markdown text into React components.
It also imports LLMOutputComponent from @llm-ui/react, indicating that this component is part of a larger UI framework.
Component Definition:

The MarkdownComponent is defined as a functional component that takes blockMatch as a prop. This prop contains the markdown content to be rendered.
Rendering Logic:

The component extracts the markdown text from blockMatch.output and passes it to the ReactMarkdown component for rendering.
The ReactMarkdown component converts the markdown text into HTML elements, allowing for rich text formatting.
**src/components/Popover.tsx**:
The src/components/Popover.tsx file defines a Popover component that displays content in a floating box, typically used for tooltips or additional information. Here are the key features and functionalities of this component:

Imports:

The component imports React hooks (useEffect, useRef, useState) for managing state and lifecycle events, as well as createPortal from react-dom to render the popover in a different part of the DOM.
Props Interface:

The component accepts the following props:
children: The content to be wrapped by the popover (e.g., a button or text).
content: The content to be displayed inside the popover.
trigger: The event that triggers the popover, defaulting to 'click' (can also be 'hover').
State Management:

The component uses useState to manage the visibility of the popover (show) and the position of the popover (popoverPosition).
It uses useRef to reference the wrapper and popover elements.
Event Handlers:

The handleMouseOver and handleMouseLeave functions manage the visibility of the popover when the trigger is set to 'hover'.
The handleClickOutside function closes the popover when a click occurs outside of the popover and its wrapper.
Effect Hooks:

The first useEffect hook adds an event listener for clicks outside the popover when it is visible and cleans it up when the component unmounts or the visibility changes.
The second useEffect hook calculates the position of the popover based on the dimensions of the wrapper and the viewport, ensuring it does not overflow the screen.
Rendering Logic:

The component renders a wrapper div that contains the children and handles mouse events or clicks to toggle the popover's visibility.
If the popover is visible, it uses createPortal to render the popover at the calculated position in the document body, allowing it to float above other content.
Styling:

The popover is styled with Tailwind CSS classes for a consistent look and feel, including background color, padding, and shadow effects.
**src/components/PreviousMessages.tsx**:
The src/components/PreviousMessages.tsx file defines a PreviousMessages component that displays a history of messages in a conversation. Here are the key features and functionalities of this component:

Imports:

The component imports necessary hooks and libraries, including icons from react-icons, ReactMarkdown for rendering markdown content, and Zustand for state management.
It also imports the ReflectingText component for displaying the current tool in use.
State Management:

The component uses useRef to reference the end of the message list for scrolling purposes.
It retrieves the current tool in use and the selected conversation messages from the useConversationStore hook.
Regular Messages State:

The component maintains a state for regularMessages, which is derived from selectedConversationMessages. This state is updated whenever the selected messages change.
Effect Hooks:

The first useEffect hook scrolls to the bottom of the message list whenever the messages change, ensuring the latest messages are visible.
The second useEffect hook processes the messages to filter out tool usage notifications and format the content appropriately. It replaces specific markers in the message content for better readability.
Rendering Logic:

The component renders a list of messages, distinguishing between messages from the user and those from the AI. It uses different styles and icons for each type of message.
Messages are displayed in a bubble format, with the content rendered using ReactMarkdown to support markdown formatting.
Current Tool Display:

If there is a current tool in use, the component renders the ReflectingText component to display the tool's name or status.
Styling:

The component uses Tailwind CSS classes for styling, ensuring a responsive and visually appealing layout.
**src/components/ToolStatusComponent.tsx**:
The src/components/ToolStatusComponent.tsx file defines a simple component that displays the status of active tools in the application. Here are the key features and functionalities of this component:

Props Interface:

The component accepts a single prop, activeTools, which is an object mapping tool names to their statuses. This prop is expected to be of type Record<string, string>.
Rendering Logic:

The component renders a heading "Active Tools" followed by an unordered list (<ul>).
It uses Object.entries to iterate over the activeTools object, creating a list item (<li>) for each tool. Each list item displays the tool name and its corresponding status.
Simplicity:

The component is straightforward and focuses solely on displaying the active tools and their statuses without any additional logic or styling.
**src/components/TypingEffect.tsx**:
The src/components/TypingEffect.tsx file defines a TypingEffect component that simulates a typing effect for displaying text. Here are the key features and functionalities of this component:

Props Interface:

The component accepts a single prop, text, which is a string representing the text to be displayed with a typing effect.
State Management:

The component uses the useState hook to manage two pieces of state:
displayText: The text currently displayed in the component.
isTyping: A boolean indicating whether the typing effect is active.
Effect Hook:

The useEffect hook is used to simulate the typing effect. When the component is in the typing state:
A timeout is set to update displayText with the provided text after a delay (2000 milliseconds in this case).
Once the text is displayed, isTyping is set to false, stopping the typing effect.
The timeout is cleared when the component unmounts or when the dependencies change to prevent memory leaks.
Rendering Logic:

The component renders the displayText using ReactMarkdown, allowing for markdown formatting in the displayed text.
Styling:

The component applies Tailwind CSS classes for styling, ensuring a consistent look and feel.
**src/components/Upload.tsx**:
The src/components/Upload.tsx file defines an Upload component that handles file uploads and manages conversations. Here are the key features and functionalities of this component:

Imports:

The component imports necessary hooks and libraries, including React hooks, the apiClient for making API requests, Zustand for state management, and icons from react-icons.
It also imports the CustomFileUploader component for handling file uploads.
File Types:

The component defines an array fileTypes that specifies the accepted file types for design uploads (PNG, JPG, JPEG, PDF).
State Management:

The component uses Zustand to manage user authentication and conversation state, retrieving the user ID and conversation-related functions.
It maintains local state for loading status, design files, and other files.
Effect Hooks:

The first useEffect hook fetches all user conversations from the server when the user ID is available.
The second useEffect hook retrieves uploaded files for the selected conversation and updates the state accordingly.
Loading Conversations:

The loadConversation function loads messages for a selected conversation and updates the conversation state.
File Upload Handling:

The handleFileUpload function processes file uploads. It constructs a FormData object and sends it to the server using the appropriate endpoint based on the file type.
The function updates the state with the newly uploaded files and handles errors during the upload process.
Rendering Logic:

The component renders a user interface for uploading files, including buttons for creating new conversations and signing out.
It displays lists of uploaded design and guideline files, allowing users to see what has been uploaded.
The CustomFileUploader component is used for handling file selection and uploads.
Truncation Function:

The truncateMiddle function is defined to truncate long file names for display purposes, ensuring they fit within the UI.
Styling:

The component uses Tailwind CSS classes for styling, ensuring a responsive and visually appealing layout.

### TypeScript Declaration Files (.d.ts)

**src/declaration.d.ts**: Contains type declarations for TypeScript, providing type information for the application.
**src/vite-env.d.ts**: Provides type definitions for Vite-specific features and environment variables.

### CSS Files

**src/App.css**: Styles for the main application component.
**src/index.css**: Global styles applied throughout the application.
**src/styles/PreviousMessages.css**: Specific styles for displaying previous messages in the chat.

The src/hooks/useBufferedStreaming.ts file defines a custom React hook called useBufferedStreaming, which is designed to manage and buffer streaming data in a conversation context. Here are the key features and functionalities of this hook:

Imports:

The hook imports necessary React functions and Zustand for state management.
It also imports unstable_batchedUpdates from react-dom to batch state updates for performance optimization.
Buffer Initialization:

A useRef hook is used to create a mutable reference buffer, which temporarily stores incoming streaming data as an array of strings.
State Management:

The hook retrieves relevant state and actions from the useConversationStore hook, including:
selectedConversationMessages: The current messages in the selected conversation.
markLastMessageAsComplete: A function to mark the last message as complete.
concatTextToLastMessage: A function to concatenate new text to the last message.
Memoization:

The hook uses useMemo to memoize previousMessages and lastMessage to avoid unnecessary re-renders and optimize performance.
previousMessages holds the current messages, while lastMessage filters for the most recent streaming message.
Effect Hooks:

The first useEffect hook checks if the last message contains a specific marker ([DONE-STREAMING-APRV-AI]). If it does, it flushes the buffer and marks the last message as complete.
The flushBuffer function processes the buffered content, concatenating it to the last message and clearing the buffer.
Buffer Flushing:

The second useEffect hook sets up an interval that calls flushBuffer every 10 milliseconds to ensure that buffered content is processed in a timely manner. It cleans up the interval on component unmount.
Return Values:

The hook returns an object containing:
addToBuffer: A function to add new content to the buffer.
previousMessages: The memoized previous messages.

Explanation of src/services/axiosConfig.ts
The src/services/axiosConfig.ts file configures an Axios instance for making HTTP requests in the application. Here are the key features and functionalities of this configuration:

Imports:

The file imports axios and AxiosError for making HTTP requests and handling errors.
It also imports jwtDecode from the jwt-decode library to decode JWT tokens.
The useAuthStore hook is imported to access authentication state.
User ID Extraction:

The getUserId function takes a JWT token as an argument, decodes it, and returns the expiration time in milliseconds. If the token is invalid or does not contain an expiration, it returns null.
Axios Instance Creation:

An Axios instance named apiClient is created with a base URL that defaults to an environment variable (VITE_APRV_AI_API_URL) or falls back to http://localhost:9000.
The default headers include Content-Type: application/json.
Request Interceptor:

The request interceptor checks if the request is for the /auth/google endpoint and skips token handling for that specific request.
It retrieves the access token and its expiration from the useAuthStore.
If the token is valid (not expired), it adds the Authorization header with the Bearer token to the request.
Response Interceptor:

The response interceptor checks for a 401 Unauthorized status. If encountered, it clears the authentication state in the store, setting the access token, expiration, user ID, and login status to null or false.
It also handles other response errors, particularly those related to token expiration or unauthorized access.
Error Handling:

The interceptor logs unauthorized access attempts and updates the authentication state accordingly.

Explanation of src/stores/authStore.ts
The src/stores/authStore.ts file defines an authentication store using Zustand, which manages user authentication state and provides methods for updating that state. Here are the key features and functionalities of this store:

Imports:

The file imports create from Zustand to create the store and persist from Zustand middleware to enable state persistence.
It also imports the conversation and guideline checks stores to reset their states upon logout.
Interface Definition:

The AuthStore interface defines the structure of the authentication state, including:
access_token: The user's access token (string or null).
exp: The expiration time of the token (number or null).
user_id: The user's ID (string or null).
isLoggedIn: A boolean indicating whether the user is logged in.
Methods for setting the state and checking expiration.
Initial State:

The initialState object defines the default values for the authentication state, with all values set to null or false.
Store Creation:

The useAuthStore is created using Zustand's create function, with the following functionalities:
Methods to set the access token, expiration, user ID, and login status.
A logout method that resets the authentication state and calls reset methods on the conversation and guideline checks stores.
An isExpired method that checks if the access token is expired based on the current time.
Persistence:

The store is configured to persist its state in local storage under the key auth-storage, allowing the authentication state to be retained across page reloads.

Explanation of src/stores/conversationsStore.ts
The src/stores/conversationsStore.ts file defines a conversation store using Zustand, which manages the state related to user conversations in the application. Here are the key features and functionalities of this store:

Imports:

The file imports create from Zustand to create the store and types for Message and Conversation from the respective type definitions.
It also imports the guideline checks store to reset its state when creating a new conversation.
Interface Definition:

The ConversationStore interface defines the structure of the conversation state, including:
selectedConversationId: The ID of the currently selected conversation.
allUserConversations: An array of all conversations associated with the user.
selectedConversationMessages: The messages in the currently selected conversation.
selectedConversationUserInput: The user's input for the selected conversation.
selectedConversation: The currently selected conversation object.
currentToolInUse: The tool currently being used in the conversation.
Methods for updating the state and managing conversations.
Initial State:

The initialState object defines the default values for the conversation state, with all values set to undefined or empty arrays.
Store Creation:

The useConversationStore is created using Zustand's create function, with the following functionalities:
Methods to set the selected conversation ID, all user conversations, selected conversation messages, user input, and the current tool in use.
A method to add a new message to the selected conversation.
A method to mark the last message as complete, updating its streaming status.
A method to concatenate text to the last message.
A method to set the selected conversation.
A method to create a new conversation, resetting the state and clearing the guideline checks.
A method to reset the store to its initial state.
State Management:

The store provides a centralized way to manage conversation-related state, allowing components to access and update the conversation data efficiently.

Explanation of src/stores/guidelineChecksStore.ts
The src/stores/guidelineChecksStore.ts file defines a guideline checks store using Zustand, which manages the state related to guideline reviews in the application. Here are the key features and functionalities of this store:

Imports:

The file imports create from Zustand to create the store and the PageReview type from the respective type definitions.
Interface Definition:

The GuidelineChecksStore interface defines the structure of the guideline checks state, including:
reviews: An array of PageReview objects representing the reviews for conversations.
Methods for setting reviews, adding reviews for a conversation, and resetting the store.
Initial State:

The initialState object defines the default values for the guideline checks state, with reviews initialized as an empty array.
Store Creation:

The useGuidelineChecksStore is created using Zustand's create function, with the following functionalities:
A method to set the conversation reviews, updating the state with the provided reviews.
A method to add reviews for a conversation, merging new reviews with the existing ones in the state.
A method to reset the store to its initial state.
State Management:

The store provides a centralized way to manage guideline review-related state, allowing components to access and update the review data efficiently.
