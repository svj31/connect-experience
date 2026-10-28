Prerequisites
0:00
So I forgot to say this before we started, but it's important as prerequisites to know about the system design concepts we
0:07
have talked about in this entire series. Stop looking at this diagram because you know, you're not gonna understand until we actually start discussing about it.
0:14
And each of these concepts that we are gonna discuss now can be, you know,
0:19
broken down and gone deeper into. So all those concepts will require prior knowledge that that is going to be
0:26
given to you through the videos that I made earlier, and also, of course, through lots of links on the internet. So you, it's your choice.
0:32
Just make sure that you have your basics and fundamentals clear before you actually jump into actually designing a system. Okay, let's start. Hi everyone.
Picking features
0:40
We are finally here. We are finally talking about Tinder, and we are talking about its architecture.
0:46
So let's say you enter the interview room, you meet the interviewer, and you sit down. So you're asked to design Tinder. Now, in my experience,
0:55
I've seen that most candidates get really, really into the game. They, they start thinking about what services are they going to use,
1:01
what kind of databases are they going to use? Take, but, you know, my suggestion to you would be to take a step back and think of this system
1:09
in a very logical, calm way. So, if you have been inventing such a kind of an app what's going to come up in your
1:16
mind is, what kind of features will I provide this person? And with those features, what can happen is you can actually think about how your system evolves.
1:26
Two approaches that you can have for this, for starting off with this is to start with the ER diagram,
1:32
which we are taught often enough in colleges that, you know think about how the data is gonna be modeled,
1:37
and then think about how your services are gonna consume them. Finally, think about what the clients will be doing to actually call the services.
1:45
So that kind of, that kind of thinking is a little too constrained. It's also too abstract because you're thinking about how to model your data
1:52
without thinking about what do your users need. The second approach is to go from the front to back. That is,
1:59
think about what your users need as features. Think about how your services are going to actually be broken down so that you
2:06
can fulfill these features. And then think about their individual data you know,
2:11
requirements per service. So in that way, your system is far more flexible. It's also a lot easier to start off with the system immediately with,
2:20
with feature development. Per feature development. So the features that we are picking up in Tinder are storing profiles.
2:29
Alright? So you won't just write this down. First of all, what you could say or what you could ask your interviewer is,
2:35
so you are definitely gonna be storing profiles, right? So that's an obvious question, but best to get it outta the way. In that profile,
2:41
there are going to be images that's really important for any dating site. So one thing to remember here is that images will
2:49
be stored in the profile. A follow-up question can be, so how many images per user do you want? That could be five.
2:59
So I'll just note that down. Five images per user. Is there something else we wanna think about?
3:08
Images? No, we can move to the next feature that might come up, which is how are we going to
3:15
recommend matches Yeah, to look into that. But if you think of this in a,
3:21
in a storyline, what happens is you go to any dating site you make a profile,
3:26
and that's how you think about storing profiles. You start accepting or rejecting people based on your
3:33
preferences. So that would be recommendation system. That would be some sort of recommending matches. Yeah. in that case,
3:40
what are the questions you can think of? How many active users do you have? Is, is a good question to ask. So,
3:47
number of active users.
3:52
Is there something else you wanna ask? Maybe are there, are there certain countries where there's too much population stuff?
3:57
But don't get into too much details. Again, if you're, if you're running behind too many questions per feature that also shows that
4:04
you're getting into too much detail per feature. So keep it fluffy, keep keep it flying in the air. Even now then you have the third feature,
4:12
which is the best one, which is when you match with someone. So if you match with someone, you need to note that down. And you need to,
4:19
you need to do something between the two people. So one of the things you wanna do is you wanna note down matches in which case the number of active users is kind of enough.
4:27
You can take a percentage of that as the number of matches you'll have per day. That's going to be an assumption.
4:32
I'm gonna assume that typical Indian match rates are going to come up here,
4:39
which is for every swipe you have a 0.1 percentage of matching with someone,
4:44
right? So the number of matches you'll have per person is going to be 0.1%.
4:49
So that's gonna be number of active users into 10 days to power minus three
4:55
matches. And the fourth one is, once you have matched with someone, of course you need to chat with that person. So there's direct messaging,
5:02
which will be a feature of Tinder once you, once you guys match, right? In direct messaging,
5:10
what kind of questions should you ask? Well, we'll get to that, we'll get to that. For now, we have four features.
5:20
Avoid taking too many features because it's going to be an hour long interview at most. And more often than not,
5:25
you are going to be getting into the details that the interview wants you to get into. Any ways you don't need to pull out more and more features just for the sake of
5:33
showing that you know, you can implement these. Okay? So start with four or five features. Let's start with so profiles.
5:42
So storing profiles. In fact, the previous video also talked about this designing Instagram. There, there was a lot of jargon that a lot of you felt was there.
Storing images
5:52
Storing images has only one important question in it, right? And that is how are you gonna store images? So there's gonna be a lot of images.
6:00
As you can see, number of active users are large per user. You have about five images, which is still a constant factor of the number of active users. And
6:11
the, the question of how are you going to store these images is something which has been debated for a really long time in the whole technical field that we are in,
6:19
computer science. And that is whether you want to store the images as a file
6:25
or you want to store the images as a blob. Okay? So blob is a binary large object,
6:37
And those of you don't know about this get back to your database classes because this is something which is taught in, in engineering. There's also another one,
6:45
which is club character, large object. And that's entirely useless. So ignore that. We are gonna be having the argument of file versus blob.
6:55
So images typically are large in size and you can't store it as a vaca or something.
7:02
That's the reason why you have a binary large object, which is specifically for large objects in databases. Now,
7:08
you might think that databases have definitely got a lot more to offer when it comes to specialized storage compared to files,
7:17
but my argument is not really, not really, because the only few extra guarantees that a database gives you are
7:27
mut ability, okay? You can easily mutate the rules in that, in that database. Basically one data entry.
7:35
The second one is transaction guarantees. So transaction guarantees. The third one is indexes.
7:48
Okay? So indexes are mainly to improve your search capabilities,
7:53
right? Let's start with mutability. Are you ever going to be changing the image? You could, yes,
8:02
but why would you ever want to do that? Why not just create a separate file? Because an update or an image is not gonna be just a few bits,
8:08
so it's gonna be the entire image, basically. Why not? Why not store that in a separate file and get rid of mutability,
8:14
make it immutable. So this is an unnecessary feature that the database is giving us.
8:20
The second thing is transaction properties. So transaction properties are, again, not required by the by an image,
8:28
because you're not going to be doing an atomic operation on the image. So you can get rid of this. There's another feature, actually,
8:34
I better note that down. So that'll be the fourth feature, which is required, and that is access control.
8:43
So yeah, let's get to the third one again. Indexes. Indexes are good for searching.
8:48
They allow your data to be sorted according to a particular field. Let us say,
8:53
you know, you have a profile table in that the name can be indexed. So anyone who's searching for goov will find that entry quickly because it
9:01
binary searches on on the name. So for a, for a binary, any large object,
9:07
that's useless because you're now going to be searching on the content of the file. That's gonna be ones and zeros, right? So you can get rid of that.
9:14
And finally, access control. This is very important. It's one of the arguments for databases using binary log objects,
9:20
but I would say that you can get the same access control mechanisms
9:27
using a file system, right? It is a little tedious maybe, but setting up a file system,
9:34
a secure file system is almost as tedious as setting up a, a, a secure database. So nearly equal. The good things about a file are that it's,
9:44
it's cheaper. That makes a big difference. Storing files the, the other things about
9:53
files, which are good, are that they are, they're built for this. They're built for, you know, storing a file and an image is a little file.
10:00
So that's, that's one good thing, but it's a little abstract. Instead, they're also faster in a way because they're storing
10:08
large objects separately. And you can do that in a database using something called vertical partitioning,
10:14
where the profile ID is going to be over here, and the image ID is gonna be over here,
10:20
and then you're going to store the image somewhere else. But if you're doing that, then why not store it on the file, which is not just cheaper,
10:26
it's also less likely to do a select star nightmare.
10:32
So if you do a select star on this table. . So instead go for the file system, it's gonna take care of that. I mean,
10:41
you won't, you won't do a by mistake, select star on the address and the id, okay? This is a little bit of a flimsy argument, but it's still, you know,
10:50
in practical real life systems, select start is used a lot. So it's one of the good things. The third thing is that these are static.
10:58
So you can easily build a C D N over this content delivery network. You can read up on this maybe in description below. You can just read up on it.
11:06
In general content delivery Network allows fast access.
11:16
One argument for databases which are going to be storing the files. I mean, at the end of the day, your database is going to be storing all your data.
11:23
So it has to have some reference, some address to your file. And that is going to be the file, u r l.
11:32
Alright? And this will be stored in the database. So we are going to have an image ID
11:38
of image U R L and the profile ID
11:44
per image stored by user with profile ID in location. So, and so where are you gonna store this image? This file?
11:52
U l it's going to be in a distributed file system, Right? So your distributed file system is gonna be handling requirement number one,
12:04
And that's how you argue for files versus blobs. Now, if your interview is really,
12:09
really pushing you for blobs you could take it, I mean, it's not gonna really spoil your design,
12:15
it's only that it's good to have these arguments with you when you are
12:20
logically, you know, talking about what would be better in an interview. But don't push too hard. If they say that blob is what I want, go for it,
12:29
. So taking this first option, let's start designing our system. The first thing to note here is that we have a client application on
System Design
12:39
the mobile. A user actually clicks a button to send us a request, okay?
12:47
And over here we have our profile service.
12:55
Now, what does it need to do? It needs to register itself with our profile service. It needs to say here's my username,
13:04
here's my password. And the profile service then stores that in the database,
13:12
okay? Of course, there's gonna be multiple authentication mechanisms. There's gonna be a password sent to the email. So there might be an email service, which you're using here.
13:20
But for the sake of brevity, I'm just gonna assume that the profile service can send emails and can do
13:26
those two step authentication stuff. Okay? So once a user is stored in the database,
13:35
the user then asks for something, it's probably going to be update profile because they're going to be adding
13:40
their photos. So, in update profile
13:47
with the username, how do you make sure that this is an authenticated request?
13:54
The person who's claiming to update that profile is the person who that profile belongs to. There's multiple ways to do this.
14:01
The monolithic service way goes that in the profile service, you're supposed to have authentication mechanisms, making sure that yes,
14:08
this update has come from the right user. So they'll send the username and password. And if it is authenticated,
14:15
then a successful response goes back that yes, there's been an update.
14:21
Of course there's multiple issues here. The first one being that username and password is a little too un insecure. So
14:29
Instead, we can send a token, right? And these are all security mechanisms. If you mention token, you should be good.
14:35
If your interviewer gets too deep into cryptography, then best of luck. But if you have, if you're sending a token to the profile service,
14:43
it should be able to authenticate you and send back a response. Here's the problem today, there's a profile service,
14:48
which is actually authenticating and sending you back responses. If there's a new service coming up tomorrow, which doesn't have information about tokens and usernames,
14:57
then that service is going to be requiring to talk to the profile service every time. And that logic is gonna be duplicated in the third service,
15:04
which is gonna come up. It needs to authenticate the user. So every time a user sensor quest there's gonna be
15:12
a lot of duplicated code, which is going to be run. So one of the things you can do here is to a standard service,
15:19
which most places use,
15:24
is to use a gateway.
15:30
And the clients always talk to the gateway. No one talks to the clients except the gateway. So this is the gateway service,
15:42
Alright? And the gateway does one thing, essentially, it just takes this request, the username,
15:51
and the token asks the profile service whether this is authenticated request or not. So the profile service, of course,
15:59
has information about the user and the profile service says yes or no.
16:06
A yes or no response tells the gateway whether it should respect this request or not. If it needs to respect this request,
16:12
it'll direct it to the correct service, otherwise it'll fail the request.
16:18
Okay? That's, that's all that the gateway does. And once, of course, it directs it to the correct service and it gets a response,
16:24
it has to forward that response to the client. What you have done here is decoupled systems.
16:30
You have taken away this the requirement of talking to a user, and after authenticating sending it to the correct service from the profile
16:39
service, you move that to a gateway. Another good thing about this is that if you're going to be using some of the
16:45
messaging protocols that we get to once we are at direct messaging then you have separated out the protocols over here and the protocols over here,
16:54
okay? So Now that we have our profile service,
17:00
we are just going to be updating the profile. We are gonna be changing the description, we are gonna be changing the name maybe so on and so forth. Images,
17:08
do you really wanna store images in the same place that the profile services? There's no hard yes or no,
17:15
but logically you would probably want to store the images in a separate service because tomorrow,
17:21
if there's any other service which just needs the images of the user, maybe for machine learning, maybe for just, you know,
17:28
it just needs the images to send it across. So you could, you could effectively do that by using an image service.
17:37
. Rather, more sensible scenarios when you just need the details of that person's profile,
17:45
maybe just a description or maybe just the age, and you can send it across easily while the image service is used for heavy
17:52
computations when you need all images of that user. So image service is going to be, of course, having a distributed file system
18:00
in which it's gonna be storing all the images. It's also going to be having a database in which you have the profile id
18:07
and you have the image id, and you have the u r l of the image being stored in this distributed database,
18:14
right? So these are references, okay? So first requirement, done, yay, we are taking care of the first requirement,
Direct messaging for chat
18:23
and what do we do next?
18:30
The second requirement was recommendations. I wouldn't go for that. Just I mean, just now, because it's a little complicated to get into.
18:39
What I would suggest is going for direct messaging, which is chat.
18:44
So for that, one of the things you can do is you can think about how do I connect from this
18:49
client to another client, which is over here.
18:55
So this client wants to talk to this client. Imagine that you just matched with someone and you are gonna send a direct message. It means that you are gonna be telling the gateway that, Hey,
19:04
I want to send message to user idx. So instead of the update, it's gonna be message To user
19:13
ID one from user ID two. So this guy is user ID two,
19:20
And this person is user ID one. Now, the question is, how do we send a message to this user? There's a,
19:26
a lot of people who asked about what is X M P P last time? And if you know about HTT P, which is hypertext transfer protocol,
19:34
it's, it's mainly a protocol, a way of talking between two machines. And in this way of talking,
19:42
there's always going to be a client, and there's always gonna be a server. So a client talks to a server, a server responds to that request.
19:50
It's never that the server goes to the client and says that, Hey, can you gimme some data? Right? So when you have a client
20:00
server communication protocol,
20:05
you cannot have chat. You cannot effectively have chat, because if there's a client and a server,
20:11
the only way that this user is going to get the messages that are sent to them is to pull the server, is to say, every five seconds, Hey,
20:20
are there any messages for me? Hey, are there any messages for me? And that is extremely inefficient from the, from the overall app side.
20:27
So you don't wanna pull the server, you want messages to be pushed to you, And you want them to be pushed to you, then multiple ways.
20:33
You can actually do it with H T P also to some extent. But instead, the better way to do it would be to use a different protocol,
20:41
a peer-to-peer protocol where everyone is equal.
20:48
All right? So there's no client server. Now this is a machine. This is a machine that appears and if the server needs to send any message to
20:54
the client, it can. So one of the protocols actually doing this is X M P P,
21:01
alright? And one of the clients server protocols, of course is H G P. So make sure you mention this because it's it's pretty important to know
21:10
how clients and servers talk if, if there's a chat application, right? So this message is gonna also be sent through X M P P probably.
21:20
So we have discussed how we are going to send the message and get the message. But what's gonna happen internally internally,
21:28
one of the things that could happen is, you know, the connections that this person, this,
21:33
this X M P P is going to be taking a connection, and that's a web socket connection, right?
21:40
A lot of this might sound like jargon, so study . Yeah. Well, in a system design interview, you're expected to know a few things about this.
21:48
Instead of web socket. You could also simplify and say that, Hey, I'm gonna be writing a protocol of my own, but it's gonna be T C P. Yeah,
21:55
because you make a connection and you maintain it. So T C P T C P,
22:00
happy, happy. Now with these connections, you can actually talk to the clients. That's good.
22:08
Who's going to be maintaining the information of these connections as to, with every connection id,
22:18
You need to know which user is using this connection, right? So there's a set of connections on the gateway service. Each of these,
22:26
each of these users need to use this connection to be able to talk to other users. You need to find out where does this user belong? I mean,
22:33
which connection is that user listening to? And if that is the case, it could be done by the gateway service, but again,
22:41
I suggest you decouple the system as much as possible. So you take away responsibilities of maintaining connection info from the
22:48
gateway service by putting that
22:53
in another service, which can handle sessions.
23:02
So this service is going to be handling sessions in your, in your overall architecture. If you are having direct messaging,
23:11
this is more than enough because it's going to be storing connection, information, user ID to connection,
23:20
right? And with that, what you can do is you can figure out where the other user is stored.
23:26
I mean, which connection are they using? And send a message to this socket then. So direct messaging is possible. If you do match, things are looking good.
23:36
Now, However, of course, the two requirements that we had, they have been taken care of out of the, out,
23:44
the four that we had, two of them have been taken care of. The only two remaining are noting recommendations.
Matching algorithm
23:50
And the second one is, what is the second one? It's recommending suggestions. I mean, recommending people to you.
23:59
So noting recommendations. Let's quickly go over it. Let's say that you have the client, right? It can store information.
24:07
It's, it's an app, it can store information. Why not have all of that information as to who you are matched with or
24:13
who you have asked to be matched with stored on the client?
24:21
Are there any pros? Are there any pros and cons? Yeah, are there any cons to this, this thing? Well,
24:29
one of the cons is that the server should be the source of truth. You should have the server knowing everything, and you can then rebuild on,
24:37
on that. I mean, in case a client loses all the information in case they install, uninstall their app, the server has all the information,
24:43
but what kind of information are you losing when you're noting down matches? If you match with someone, send that to the server, say that, Hey,
24:52
I matched with this person that's gonna be probably sent to the profile service. Maybe it could, it could handle that, or it could be a matcher service,
25:03
Which just keeps a table of user ID to user id,
25:08
which means this user has matched with this person. Now, indexes, like we talked about,
25:14
are going to be put on each user ID over here, right? So
25:21
in fact, you can put it on both, but I'll just put it over here and you can duplicate the records. So A matched with B means B also matched with A, and you can keep it that way.
25:30
Now the macho is going to be checking if you are matched with a particular person that can tell the session service whether you are authenticated
25:40
to actually send this message to that person, a direct message. So there will be some communication between the macho and sessions.
25:48
So in case there's a message being sent, it's first gonna be sent actually to the macho, which will confirm that yes,
25:54
you have, you have been validated to send this message, sends it to the sessions, which then sends
26:02
the, the information as to where, which connection you have to use, and then you can always send it to the right place, right?
26:08
So it's a pretty long process. You might find a better way to do it, but in a,
26:14
in general, this is fine. This looks fine. Okay? Hmm.
26:20
So we are talking about noting matches. If we need to note down the matches, the matches service can note down all the matches that you have.
26:28
If the app is installed, when it is it reinstalled, it'll pull out all the matches you have from the macho,
26:34
make sure that you can chat with them. Your profile is going to be pulled out of this service. And the only information you're going to lose is the number of people you swipe
26:42
swiped left or right. Is that critical information? No, because you should get a chance, again,
26:48
to swipe a person right or left in case you've already done that earlier. So you are going to get read recommendations of the same person.
26:56
So that takes care of requirement number three. We are storing all information relevant to the number of matches
27:03
you have had on this mattress service. And all information relevant to who you have swiped left or right inside
27:10
your cell phone. And in case you uninstall it too bad, you have to do it again. That's all not that big a loss. So three requirements taken care of,
Recommendation Engine
27:18
that's good. The final requirement we are going to be looking into is a little complicated.
27:23
It's about recommending people to you. And let's see how we can actually put it in this architecture.
27:29
The biggest problem with recommendation will be to figure out who are the users close to me? So I can figure out quite easily which genders I'm interested in.
27:39
Which age group am I interested in using just indexes. But when you look at this number of users,
27:45
you have a million active users you have to per user figure out which person is close to me, right?
27:52
That is the core of all recommendations in this system.
27:57
So the profile service could have in its database,
28:06
I mean the name of the person and all those things, but they also have the age. That's good. We also need the gender, right?
28:13
And we also need another thing, which is the location. So based on age, gender, and location, these three things we need to make decisions. Now,
28:23
a lot of people would probably come to the conclusion that why not put indexes on all three? Okay? And this is a common misconception.
28:30
You cannot have multiple indexes. Basically, you cannot have the data sorted in multiple ways in one database
28:38
table. So if it is sorted by age, and it is sorted by gender, and it is sorted by location, when you're going to be making a query,
28:46
it's only going to use one of those indexes. Okay? So it might use the gender index, maybe I'm interested in females.
28:53
So the female category will be picked up by the database. It'll be made efficient that only females will be picked up in just one shot
29:00
because there's a, there's a binary search going on over there. And in that, I'll have to search for people within a particular range. And in that,
29:06
I'll again have to search for people within a particular location. So it depends on what the database picks up as the single index that you have.
29:13
But because it depends on the database, because it depends on the database optimizer, query optimizer,
29:19
it's outta your control, right? Pretty much. So, I mean, you can, you can suggest the query optimizer,
29:25
but what I'm getting to is that you need to optimize on multiple parameters, and you can effectively do it only on just one.
29:35
So in this case, what happens is you need to use either a NoSQL
29:41
database like Cassandra, which is really good at querying for these kind of data types. You know,
29:46
you just replicate the data in multiple places, and depending on the query, you build a table on that query, and then you can have an efficient query.
29:55
So one of the things about the recommendation database is you could have a, you could have a distributed database, which is something like Cassandra
30:06
Or Amazon Dynamo, okay? That's the first solution.
30:12
The second solution is if a person is not very comfortable moving onto a distributed database, you could use the same concepts kind of on a
30:22
relational database. And that requires something called sharding,
30:28
also known by the veterans as horizontal
30:33
party. Shun in horizontal. Parting means you take some property of a data,
30:40
basically you set ranges in one, in one column, and you direct data to a location based on that range.
30:50
So a lot of fluff that I just talked about, what about name, right?
30:55
All users having the name starting from A to J are going to go to database. Node number 36,
31:05
all users having it from K to P are going to database node number 79. Now you see what's happening here.
31:12
I'm partitioning the data based on its value to different locations.
31:17
And in this case, what happens is when I'm going to be querying the data, I can easily figure out what's the name of this person? Oh,
31:23
then it must exist in database number. So and so, Right? Partitioning as a concept is really useful. One of the,
31:33
one of the ways that you can partition data is sharding or horizontal parting. So I would suggest you have a look at the consistent hashing thing. Anyway,
31:41
this is consistent hashing is gonna be critical to keeping your servers functioning. So after that, you can also have a look at sharding,
31:49
which I'll probably take a video on sometime, but that's it, that's what charting is. You just do horizontal partitioning and based on your value,
31:56
you're going to go to a particular node. As usual. What about the single point of failure? What if this node crashes?
32:04
Are all users from K to P going to fail? I mean, the, are the requests going to fail? No, you can have a master slave architecture.
32:09
Sure. So if the master fails, the slave comes up. If the slave fails, then you're happy. , no, I mean,
32:18
the slave failing has a really low probability because both of them have failed at the same time. You can bring up a node in between.
32:23
So that is sort of how you are going to be doing the horizontal partitioning per, per partition. You can have a master slave or multiple masters and slaves,
32:33
but then you know, you, you need to convince your interviewer as to why you're choosing sharding,
32:40
which is a little complicated, versus using a, using a database like Cassandra or Dynamo,
32:45
which is going to give you all of those features in one shot. Okay? Now, why am I using sharding? Why am I using Cassandra? I mean,
32:53
why am I talking about all this? I'm so sorry. The reason I'm doing this is because you need to shard the
32:59
data based on the location that that person is in. So it doesn't need to be necessarily a city. It could be chunks of that city.
33:08
You can, you can figure out that, okay, a person within this location is within this chunk,
33:13
and if it is within this chunk, they are being sharded to a particular node, okay? Based on that chunk. Therefore, you can easily pull out data. Also,
33:23
you can pull this data out all users within that chunk and then search amongst it within the age and the gender
33:34
variables. So each of these databases can actually have the age sorted and you can query on
33:40
the age. And then finally you just filter out the genders that the person is not interested in. Okay?
33:47
So this is the kind of stuff that you could do basically to improve your recommendation engine.
33:53
Your recommendation engine is gonna be simple enough, it's gonna be a recommendation service.
34:04
All it does is it pulls out all relevant people, maybe from the same profile service thing,
34:10
or it could just be storing the user IDs and the locations,
34:16
the current location, this current location can be updated every hour, every two hours, every three hours. Depends on the client.
34:23
It can push that thing, or the number of pushes it makes, doesn't matter only after an hour, you are gonna make an update to the location,
34:31
and based on this location, you're going to be serving users for that particular user.
34:39
Alright? Okay. If all, any of this is going, you know, seeming too complicated,
Final pointers
34:45
it's fine. It may not be the right time to just start off with billing systems.
34:51
But you can, you can get the general gist of what's happening if you're, if you're able to break this system down into pieces,
34:56
and if you're able to essentially partition and partition and remove single points of failure and figure out how these features are going to be done using
35:05
interactions with each of these services, then you're doing well. Alright, good job, good job. And that's pretty much it. I,
35:14
I think that takes care of the second point also of recommending people
35:19
you can recommend using this way that takes care of all four points, in fact. And Tinder is one of these services,
35:26
which in fact seems quite simple and, and is because there's not so much of a newsfeed that you need to take care of.
35:34
There's not really a lot of, a lot of social interactions going on. Like, it's not group messaging,
35:40
it's just direct messaging. So it's a nice system to start with. I think it's one of the interesting systems I felt that I should start with.
35:48
And if you have any suggestions or if you feel like there was something that we missed out on definitely leave them the comments below.
35:54
I think we are gonna have a really fruitful discussion in the comments below after this. And if you have any doubts on this,
36:01
feel free to ask. I'll try to post as needed, relevant sources in the description. If you like this video,
36:08
then you can just hit the like button and also just subscribe to the channel, because I'll be posting on similar services all the time,
36:16
. So yeah, that also gives me the, the question as to which service do you guys wanna see?
36:22
Do you wanna see Instagram, Twitter? It's up to you guys. I mean, basically just leave a comment or maybe I'll take a poll. That'll be easier.
36:31
Just make sure that you subscribe so you get a notification for the poll. Also, others I have to ask every time, and I'll see you then next time.