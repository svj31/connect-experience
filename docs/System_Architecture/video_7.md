0:00
Hey guys, this is GKCS!
0:01
It's been a long time since we have made a system design video and today we'll
0:05
be talking about designing Instagram.
Feature Selection
0:10
An obvious thing about Instagram is that you can store and get images.
0:14
So that feature we can assume to always be
0:20
in an Instagram interview. Now, any other feature is not obvious,
0:25
so don't jump to what you'll be building before your interview actually mentions
0:29
it. You might have used Instagram, you might know what it does. However,
0:32
the interview might be expecting something and they,
0:34
they might know that the time constraints doesn't allow you to dig deep into all
0:38
of these features. So better ask them, what do you expect?
0:42
So the interviewer might mention that you want to provide a like
0:47
plus comment facility for an image,
0:53
right? You can also share an image in Facebook.
0:55
I'm not very sure about Instagram,
0:56
but let's keep it simple like and comment on posts.
1:01
The third thing is you can actually follow someone.
1:07
So every Instagram account is that of a user. That's my expectation.
1:11
In Facebook, again,
1:12
you have a bigger complication that pages can actually be followed.
1:17
And the fourth thing is you need to publish
1:23
a newsfeed. Alright?
1:27
These are the four key features that we have of Instagram.
1:31
It may not be the most selling thing, but of course as a system design engineer,
1:35
these are the things which are difficult to design,
1:37
or at least these are the basics that we should know when we are doing
1:39
Instagram. So amongst these,
1:42
storing and getting images is something that we already done in our Tinder
1:46
video. Tinder video it's in a card floating up there somewhere.
1:51
So the key things over here is that you want cheaper storage.
1:55
So you probably go for a file system,
1:57
you create a C D N over it so that things are fast.
2:00
And just have a look at the Tinder you know,
2:04
video to get a better understanding here.
2:06
The second thing is liking and commenting on images.
2:09
Now images are nothing but posts
2:12
and the concept of a post is pretty interesting.
2:16
Can you comment on a comment? Is a question to ask. So is this recursive?
2:22
This is a question. Can you like a comment? Now,
2:25
Instagram does provide you the facility to like a comment.
2:28
Instagram does not provide you the facility to comment on a comment on a
2:33
comment. You know, it gives you one layer. So if there is a comment over here,
2:39
You can actually reply to that, but you can't reply to reply.
2:44
So through this, it keeps the level of complexity constraint. Yeah,
2:49
there's just one level of comment and then reply. However,
2:53
there's nothing really stopping the system mathematically from making a reply to
2:56
a reply. But this is a interview.
3:01
So we'll keep things simple and we'll say that you can't even reply on a
3:04
comment. There's a single comment you can do. Okay? So no complexities here.
3:09
You can like a comment though, I'll give you that. You can like
3:13
a comment.
DB Schema
3:15
So if you think in terms of the ER diagram of this feature,
3:19
single feature of liking and commenting,
3:21
we will have the like stable being represented as the post, which was liked,
3:26
who liked it, the user id, the timestamp.
3:29
At what time did they actually like the post?
3:31
And is the like still active is one thing or you can just delete it. Yeah,
3:35
it shouldn't be too much of an issue, but I will just call it active or not.
3:40
Now, we just said that likes can actually be on comments also.
3:44
So the post ID could be useful,
3:46
it could tell us the post in which the comment existed.
3:49
But a better way to represent this would be,
3:52
I mean the only way to represent this,
3:54
so to speak is parent id,
3:59
parent ID could be either a comment or a post.
4:02
So how do I figure out looking at a, like whether it's from a comment or a post?
4:07
One of the things you can do is you can,
4:08
in the parent ID itself mentioned comment underscore 1, 2, 3, and 1, 2,
4:13
3 could be the comment ID here. Okay? But this is pretty poor design.
4:18
Instead, what you can keep is a type field.
4:24
So this type is going to be either comment
4:28
or it's going to be a post. And using this, using the type,
4:32
you can tell what type of parent do I have,
4:36
which tells you where to query in case you want to know what is the original
4:39
thing, which is liked by the user. Okay?
4:43
So these are the kind of things that we can do with just the like table.
4:48
What if you need to find the number of likes for a particular post,
4:53
you can do a select star,
4:57
I mean select count star rather.
5:02
And if you're finding any of this complicated, you know,
5:05
just have a look at the other system design videos. In fact,
5:07
you shouldn't be finding this complicated. It's an ER diagram. So yeah,
5:11
in case you're finding it complicated,
5:12
I'll mention a link in the description below. It's on databases.
5:15
You can have a look at that count star from likes
5:21
where
5:24
Post ID equal to some user parameter. So if you're passing in the post id,
5:29
I can tell you the number of likes in that post. However,
5:33
we should be flexible and we should be thinking about things which are going to
5:37
happen in the future. You need to be able to generate a newsfeed.
5:40
And a newsfeed is going to have a lot of images,
5:42
a lot of posts that will fire a lot of select star queries.
5:47
So this is one way it's gonna be time slow. We are going to ignore this way
5:53
here.
5:54
What you could do is add a column called likes.
6:01
And whenever there's a like added for a particular parent id,
6:04
if that parent ID exists in post, then you increment this likes column.
6:09
If the parent ID exists, I mean is is a type comment,
6:13
then you increment the likes column over here.
6:19
However.
6:19
This is pretty bad design because you have something which is not really
6:24
relevant to this table kept here.
6:26
It's an aggregation information which is being stored in the original table for
6:31
convenience. Okay? So again,
6:33
we are going to be changing our design a little bit and saying we are not gonna
6:37
be storing likes here. Main reason being that it doesn't belong there.
6:41
If you have a comment being pulled out, you also have a number of likes.
6:44
So there could be useful, could maybe not.
6:46
Instead you can have an activity table.
6:54
And this is going to be defining the number of likes
6:59
for a particular parent id. So I'll just call it
7:04
activity id and it's gonna be activity
7:08
id and it can store the type two.
7:13
But do we really need to, no, it's just aggregation.
7:16
So you don't need to store the type. You could, but you don't need to.
7:22
What else do we need? Well, the comment is going to have an ID itself.
7:26
It's going to be having
7:29
something called textual information. Yeah,
7:33
could a comment have an image? It could, you need an image all then,
7:36
but right now comments can't have images. And you let,
7:40
let's try to figure out there's a timestamp, which is always going to be there.
7:45
Anything else we have actually missed out something on the likes here.
7:52
By putting a comment id, what I should do is I should also put a, like ID
7:57
and nearly all tables have IDs.
8:00
This row is going to be defined using this id, okay? A u u Id maybe
8:07
Uniquely identifies this role.
8:08
So uniquely identifies this action where there was a like done by this user on
8:12
this activity at this time, and so on and so forth. Okay? Now,
8:16
whenever your system is queried on,
8:19
let's say find me the number of likes on this post,
8:24
it can just go and query this table whenever there's a question on find me all
8:29
the comments for this particular post queries, this table, find me,
8:33
all the people who have liked this post comes on this table. And the queries,
8:38
I'll mention them in the description below. I'll just, you know,
8:41
because the queries are mainly database queries.
8:44
But what we can understand here is that we have designed the system such that
8:47
the information is available in a nice way. Okay?
8:50
So this is our original ER diagram. And of course if you need the post itself,
8:54
you have the post ID right here. Ah, interesting.
8:59
Get me all the posts for this user is something that we might do.
9:04
So the post is going to be having a user ID too.
9:09
Okay, who has made this post? Alright, so as you can see,
9:15
making an year diagram is not easy. It's a lot of you know,
9:20
changing your tables,
9:21
understanding how you will be showing that information or retrieving that
9:25
information. But keep your diagram flexible.
9:29
Make sure that you are keeping everything which is in future and current in
9:33
mind. Sometimes you can't, you don't think about the future too much.
9:36
So in that case, just try to keep your tables as simple as possible.
9:40
So feature number one and two are done.
User Followers and Following
9:45
The third feature is actually very easy.
9:47
All it does is a user following another user.
9:50
So there's two kind of questions you can ask.
9:52
The first one being that who follows me?
9:54
And the second one being who are the people who I follow?
9:57
So with those two questions, both of them can be answered using a single table.
10:02
We have the follower user id, the person who is following someone,
10:06
the followee user ID is going to be the person who is being followed that
10:10
person's user ID and the time at which they start following.
10:13
So this takes care of the whole thing. Let's say
10:18
follows Stephen Hawking.
10:22
Alright at timestamped, let's say today,
10:27
now there's gonna be lots of other users who follow Stephen Hawking.
10:32
So whenever I need to find the people who are following Stephen Hawking,
10:35
I just come to this column,
10:37
put a equals condition saying that Hawking and give me all the followers.
10:41
So it gives you all the followers as a list. Similarly,
10:44
who are the people who got followers? Gotta probably follows a lot more people.
10:48
There's Bill Gates. So these kind of guys,
10:51
when I can actually get their user IDs using just a single equals
10:56
on this column, that takes care of
11:01
Requirement number three.
11:02
One of the questions I'm often asked is that during an interview,
11:05
if you know the answer to a question,
11:07
should you build the answer slowly or should you just directly give the answer?
11:11
I believe you should directly give the answer.
11:12
It saves a lot of time for the interviewer and for you.
11:16
It's also something that I really appreciate because it,
11:19
it shows that the person has prepared. Well.
11:21
Two things which are for this point are that the interviewer is probably
11:24
expecting to ask you more questions. So this is a simple one.
11:27
If you answer it quickly, they'll ask you the next one. The second thing is,
11:30
if you answer this quickly,
11:32
they can get into the advanced topics that they really wanna talk about.
11:35
That is the approach we're taking in this video too.
11:38
We are not going for extremely simple answers.
11:39
We are going for slightly advanced system design concepts.
11:42
I'll be explaining this design using animations because that would be clearer.
11:46
If at any point you find something too complicated or if at any point you see
11:49
something that you don't understand,
11:50
you can always fall back on the system design videos,
11:52
especially at the system design for Tinder video,
11:54
because there's a lot of things like the proxy and routing that we talk about
11:59
over there.
System Design
12:02
Since Instagram is a mobile application,
12:05
it needs a way to connect to our server side.
12:07
I'm going to be assuming that there's a gateway which is going to be
12:10
encapsulating a lot of things.
12:11
The reverse proxy is also the gateway for me because it's going to be deciding
12:16
where to send the request to.
12:17
It's going to be encapsulating some security mechanisms like authentication
12:21
tokens and so on and so forth.
12:23
One important thing that the gateway can do is it can take external protocols.
12:26
Well-Known public protocols like S T P or sending messages or web
12:31
sockets is through X M P P.
12:32
Usually these protocols can be converted to a protocol that we understand
12:37
internally. We might be talking over some other protocol.
12:42
Now this is just added security so that no one knows how to hit your server
12:45
using the language that you understand. And that can be done using the gateway.
12:50
Now, when a simple request like get user feed comes in,
12:53
which takes a parameter of user id, it'll come to one of our internal services.
12:57
I'm assuming there's a service called User feed service.
13:01
This service provides the user feed for a user.
13:04
So that is the top 20 posts that the user needs to look at.
13:08
It'll be like a newsfeed to make the service resilient and also to
13:12
scale, we need multiple servers running the same server.
13:16
If you bring in multiple servers,
13:17
you bring the question of how do I route a request from the user's cell phone to
13:22
a server in my server site? This can be done using a load balancer.
13:27
Now it's too expensive to ask the load balancer every time where to route the
13:31
request.
13:31
So what we can do is we can store snapshots of the entire system.
13:36
The load ban will be maintaining the state of the entire system.
13:39
It's like a snapshot of all the services and where they exist in which boxes and
13:43
how do I connect to them.
13:44
That kind of information is stored on the load ban and it keeps coordinating
13:49
with the gateways and every other service in the system making sure that they
13:53
know how to send a request to the correct area.
13:55
So the load ban sends this information to the gateway as a snapshot.
13:59
This snapshot will be periodically updated, let's say every 10 seconds.
14:02
So when the gateway gets this user feed request,
14:06
it reads from the snapshot where it should send the request to which user feed
14:10
service box should it send the request to, and then forwards that request.
14:15
I'm assuming that the load is balanced using consistent hashing.
14:18
So just by hashing the user id,
14:19
you can find the box where you should send the request. Importantly,
14:24
the user feed service is dependent on two other services,
14:28
the posts service and the follow service.
14:33
The post service,
14:33
as you can think of it just stores information about the posts that a user has
14:37
been made.
14:38
So it'll be giving you the posts for every user ID or maybe post for a
14:42
particular day and so on and so forth. Those are the APIs that you'll expose.
14:45
The follow service tells you the two important questions answer to the two
14:49
important questions of who are the people I follow and who are the people who
14:53
follow me. Apart from this, of course,
14:56
there's a lot of services that I'm just going to be skipping because we have
14:59
either already spoken about them or they're not called to this particular
15:03
application and we'll be speaking about them in future. So just to name a few.
15:06
One would be the image service. There's also the activity service,
15:10
which you have explained. There's the chat module.
15:14
I would say it's not even a single service,
15:15
it's a entire set of services and the profile service which is gonna be storing
15:20
user information like the profile picture sessions management
15:25
and so on and so forth.
15:26
So there's a lot of things that we are going to be keeping hidden for
15:31
now so that we understand the important features that we need to build
15:34
currently.
15:36
Now getting back to the question of how do I find the user feed for a particular
15:39
user id, the simple way would be to get all the people who I follow.
15:43
So get users followed by and you pass in a user ID that returns the people
15:48
who are followed by this particular user id. So if I pass in my user id,
15:52
I get all the users who I'm following. Once I have this set of users,
15:58
I can get the posts made by these users. For that,
16:02
I'll need to query the posts service. Once I run this,
16:05
get posts by user in a fall loop,
16:07
I mean basically I'm going to be finding the posts by every user who I follow.
16:11
So that'll be, let's say if I have 10 users who I follow,
16:14
I'm going to be making 10 requests to the post service.
16:17
I'm going to be then condensing all that information.
16:19
I'm going to be converting into a single set and then returning to the mobile
16:24
application through the gateway. Now,
16:26
there's a lot of wasteful competition over here. You can expose an A P I,
16:30
which is guest get posts by users,
16:33
and you pass in a set of user IDs and you get all the posts in just one go.
16:37
So that would be one optimization that we can do.
16:42
The second optimization would be just to limit the number of posts that we are
16:46
calling out of this post service because that would reduce the load on the
16:50
database that it's using internally and reduce the load on the service also,
16:53
so the network load will reduce.
16:54
And of course when we are sending back to the client,
16:57
that would also reduce the load. However,
17:01
this is not going to scale if for every user feed request we have to recompute
17:06
all the posts that this person wants to see. It's going to be too expensive,
17:10
especially on the post service.
17:12
It's going to get bombarded and those complex queries that the post service has
17:16
to do. In fact,
17:17
most likely you'll be ending up doing some joins on the post requests on that
17:22
database. So it's definitely not gonna scale.
17:26
The correct solution in this case is to pre-compute the user feed.
17:30
Anytime a user feed request comes in,
17:32
we just return the user feed in one shot because we have pre-computer it.
17:38
The only question which remains is how do we pre-compute what is the user feed?
17:44
It's a set of posts that I want to see. What are those posts?
17:48
I I want to see the posts made by people who I follow. Okay,
17:53
breaking down this problem,
17:54
it comes to every time a person who I follow posts something on Instagram,
17:59
we need to update my user feed.
18:03
So whenever there's a post request from a user, it goes to a post service,
18:08
gets persistent on the database,
18:09
and the post service should actually send a notification to the user feed
18:14
service saying that, Hey, here is a post.
18:18
You should update your pre-computer user feed depending on
18:23
who are the people who follow the person who has made this post.
18:28
Alright?
18:29
So what that is allowing is that there's a small incremental update on the user
18:33
feeds of people who follow this particular user.
18:36
So if I imagine a few lists of posts,
18:38
which is nothing but the user feed of user ID one, two, and three,
18:42
all I need to do is find the user ID of the person who has just made a post,
18:47
get their followers,
18:48
and then add to each one sku.
18:53
Since the size of the SKU is at most 20,
18:56
this is a pretty efficient way to store the user feed.
19:00
Now since we are talking about storage, where should we store this data?
19:04
Should it be on the database or should it be on the cache? Personally,
19:07
I would prefer using the cache.
19:09
The reason for this is because it's going to be separating a lot of the logic
19:14
that we have on this user feed service. Anytime we lose any kind of data,
19:17
we can recompute it using the previous brute force formula that we had.
19:22
Basically finding all the people who I follow and then getting their posts.
19:26
So that would be a one time thing in case there is a problem with
19:31
the memory. So when can there be a problem with the memory? Well,
19:35
if the service crashes, that's fine. It's stateless, it can again be compute.
19:39
Also one thing that could happen is you don't have infinite memory, you know,
19:42
in cache.
19:43
So what you're gonna be doing is the most recently used users will be the ones
19:48
who will have the user feed served by cache.
19:49
If there's a person who's logging in infrequently,
19:52
there's no use wasting memory for them. When they do log in,
19:56
then we can recompute the user feed for them and then, you know,
20:00
the cash management policies are going to take care of the user feeds for that
20:02
user. So this is a really nice way,
20:05
I think what we can do is we can use caches to store the user feeds and it's
20:09
going to get to the users very quickly.
20:13
One interesting thing with this user feed service is that every time it gets a
20:16
new post which it has to show to the relevant users,
20:20
it can actually send notifications to the relevant users.
20:26
So if there are two people who are following User X,
20:29
then the user feed service will notify those two users. Also, of course,
20:33
for this,
20:33
you need either polling from the cell phones every 10 seconds,
20:38
they keep polling that, is there anything new in my user feed?
20:40
And so on and so forth. That's a slightly expensive operation,
20:43
depends on your use case of course,
20:45
but you can imagine the cell phone taking more bandwidth and more battery for
20:50
this kind of stuff.
20:51
You can push notifications from the server using multiple ways.
20:56
My favorite is web sockets. But yeah,
20:59
you can use long polling and so on and so forth.
21:03
An interesting thing is how do you route these requests back to the cell phones?
21:08
And especially when there's just one request coming from the server side and it
21:11
has to be routed to let's say 50 or 60 users who are following this user.
21:15
So we'll be discussing that in the next video, which is a chat service.
21:21
In fact,
21:21
I think I have already discussed a little bit about this in the Tinder video,
21:24
so you can get an idea over there and you can look for a detailed description in
21:28
the next video.
21:29
The final use case is that what if a celebrity makes a post a person with
Celebrity post fanout
21:34
millions of followers? In this case,
21:36
what would happen is if the user feed service behaves in the normal way,
21:41
it's going to be sending out notifications to a million users,
21:44
and that is going to crash the system more likely because sending a million
21:48
requests is, is too heavy a task to be done immediately.
21:52
There's two approaches to solving this. One is batch processing,
21:55
where you send notifications in a batch of 1000 people. So every,
21:59
let's say 10 seconds,
22:00
you send a notification to a hundred people the next 10 seconds,
22:05
a hundred people,
22:05
and basically you are rate limiting the number of requests you're sending
22:08
outside. And the other approach, which is very interesting,
22:11
is that you don't send notifications to the users.
22:15
You wait for them to pull notifications from you.
22:19
Now you've seen these green boxes over here,
22:20
maybe they're fans of this particular celebrity. What they'll be doing,
22:24
what the applications will be doing is that periodically they'll be pulling the
22:28
server for requests.
22:30
So this is a pull model that we have instead of a push model.
22:33
The push model always has a problem of fanning out where there's millions of
22:36
requests you need to sign and it goes crazy.
22:39
The pull model has advantage that you can do this slowly because there's a lot
22:42
of users who are not going to be pulling at the same time. The push model,
22:46
of course, has the advantage that it's very seamless.
22:49
The moment there's a request,
22:50
you give that notification back to the users and they feel like it's happening
22:53
all in real time. So in this debate of pull versus push,
22:59
what you're really looking for is a hybrid model. Whenever there's a celebrity,
23:03
what you want to do is you want to go for the pull model because there's too
23:05
many requests to send. And whenever there's a normal user,
23:09
you can go for the push model. So that the thing is seamless. In general,
23:13
this architecture is excellent. When you're looking for a newsfeed,
23:16
there's a lot of applications which has this Facebook, Twitter, Cora Instagram,
23:21
like we have spoken about.
23:22
All these applications require some sort of queue or list
23:27
in which you are going to be maintaining a size of X number of posts that a
23:31
person has made, and then you send it to all their followers.
23:35
With this architecture, user feed services are done,
23:39
so that takes care of the fourth feature, which is the user feed service.
23:42
Of course, in a real interview, they can get into anything.
23:45
They can get into the profile service, maybe the chat module,
23:48
which I've not talked about.
23:49
You know Instagram does provide direct messaging or they can talk about
23:53
something like while using the H T P protocol or web sockets and et cetera,
23:57
et cetera.
23:58
But if you can actually come up with these kind of justifications and arguments
24:02
for the things that you're building,
24:04
it shows that you understand the system at a good level.
24:06
Feel free to leave any doubts or suggestions that you have below.
24:09
If you like the video, then hit the like button.
24:11
And if you want notifications for further videos, hit the subscribe button.
24:14
I'll see you next time.
