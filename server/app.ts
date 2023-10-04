import FriendConcept from "./concepts/friend";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";
import CounterConcept from "./concepts/counter";
import TimerConcept from "./concepts/timer";
import FeedConcept from "./concepts/feed";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Counter = new CounterConcept();
export const Timer = new TimerConcept();
export const Feed = new FeedConcept();
