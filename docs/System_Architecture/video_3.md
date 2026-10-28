0:03
hey everyone this is anshul sadariya software engineer 3 at Google I have a
0:10
question for all of you how many of you have used dating applications like Tinder Bumble and I
0:17
don't know what all other names are there I already feel old don't lie to me I can already see your
0:22
smirks behind the screens so did you know that the initial name of
0:28
Tinder was Matchbox obviously because of the pun match because it was meant to match different
0:36
people and Matchbox because it was igniting new sparks no this video is not about me sharing
0:43
some fun facts about dating applications but a rather interesting system design yes we are going to do a system design
0:51
for dating applications so if I use Tinder Bumble dating applications or dating sites don't be confused we are
0:58
going to talk about the same thing before we begin it's a humble request to all of you if you have not seen my
1:04
previous video of system design of Twitter do check it out after you watch
1:10
this complete video this is going to be a more interesting video because we are going to do live
1:16
system design we are going to have some interesting discussions do some design choices so what are we waiting for but
1:23
before we jump into the video if you want to keep learning from industry leading experts do check out scalar's
1:30
free master classes on scalar's event page link is in the description below so let's get started
1:37
so what are the prerequisites that you should keep in mind before you watch this video or continue watching this
1:43
video absolutely nothing because this video is meant for you to learn new stuff we'll
1:49
be discussing new design strategies and so on but if you want to get the most out of this video I would really
1:55
recommend if you understand some of the computer science fundamentals okay when I talk about computer science
2:01
fundamentals I mean networking databases dbms and so on
2:12
you should understand what are the pros and cons of a choice of one database over the other
2:17
and you will also definitely hear some technical jargon here and there so if you hear some
2:24
technical jargon don't worry make sure you note it down and I would really love
2:30
if you search it over the web even if you don't understand don't feel scared ask me in the comment section I will be
2:37
very happy to resolve any doubt of yours this video is going to be like a roller coaster but make sure you keep your eyes
2:44
open you will feel excited there will be some thrill and you will feel scared at some moments as well but don't worry as
2:51
long as you have that learning attitude now the first step before you jump into
2:57
the system design is to make sure you don't actually jump into the system design make sure you prepare the
3:03
requirements like what all things you should add in your system what all features should be added to the system
3:09
and then only post the decision of requirements jump into the design
3:14
choices like what databases you want to use how the data should be modeled and so on but this is my preference there
3:21
are two School of thoughts regarding this one is the bottom of approach where they decide the ER model The Entity
3:27
relationship model what data will be stored how it will it will be stored then they decide how the services what
3:34
services will consume the data on top of that they will decide how the client or
3:40
the user will interact with this Services personally I don't prefer this approach and this is my personal opinion
3:46
I'm repeating again my personal preference is a top-down approach where we create the feature requirements then
3:53
we decide what all services are required to make sure that this feature requirements are complete on bottom of
4:01
that we will decide what data will be stored how it will be stored and then prepare a ER model based upon the
4:07
services and what they will consume so we are going to use a top-down approach
4:12
in this system design video and the primary reason I love this approach is because once the requirements are locked
4:19
the design decisions become a lot simpler if you want to understand the real power of requirements do check out
4:27
my video on Twitter system design now how about you tell me in the comment section what all requirements you would
4:34
have decided if you are designing Tinder or any other dating application for the sake of clarity I am going to
4:41
categorize the features or the requirements into two categories functional requirements and
4:47
non-functional ones now functional requirements are the ones
4:54
which actually influence the Journey of a user like how the user will interact with what all features now let's go step
5:01
by step to understand what a customer Journey will look like first of all a customer would want to create that
5:07
profile or register onto the dating site so let's change the color
5:13
create profile okay pardon my handwriting because I
5:20
know it's really bad I have not written for a very long time so we will create a profile next I would really want to
5:27
update my profile as and when required for example if I got promoted I would want to mention that thing I would want
5:33
to update my profile so the user should be given an option to update
5:39
okay I am not going to write enter update profile so post that uh what all things does a user actually do if I
5:46
remember my journey when I was like exploring dating sites so I would want
5:51
to set my preferences yes definitely like what age range am I looking for for example I'm 24 right now so I might
5:58
prefer people who are in the age range of 20 to 24 25 something I guess and
6:03
what all gender orientation I'm looking for male female or any other non-binary gender orientation so my preference
6:10
would be female and then I would have some location preferences as well like do I want to connect with females in the
6:18
radius of 10 miles or 50 miles or what am I looking for so we should definitely
6:23
be able to set preferences okay I'm not going to write this
6:29
complete again we should be able to set preferences and further down in this video we will understand how this
6:36
preferences will actually influence the recommendation service okay I am not going to reveal a lot of details because
6:42
that will be covered down the lane in the video now we have set the preferences our profile is ready what's
6:49
the next part swipe left or swipe right so the user should be able to swipe
6:56
and post like swiping left and right let's say you swipe right on someone and then someone swiped right on you as well
7:03
like the same person swiped right on you so you both have matched okay now you should be allowed to chat with each
7:09
other so we should be given a possibility or a feature to chat with
7:15
each other once we have matched with different people this is what I feel should be your
7:21
functional requirements do you think there should be more functional requirements which we should consider let me think about it oh yeah definitely
7:27
like we would want to upload some images right because from my experience we don't usually look at what the person
7:33
has written in the profile we usually judge the People based on their appearances unfortunately but that's the
7:39
harsh truth so I should this this functional requirement should come on the top but upload pics
7:47
yeah again ignore my handwriting so we should be given a preference to upload pics and we will decide in this video
7:54
like we will make some designed uh discussions like what data store should we use whether we should use a data
7:59
store or not so I think this functional requirements should be sufficient to get started with
8:05
designing our system of Tinder or Bumble let me know if you think otherwise
8:10
because I remember from my experience there are some other cool features as well like uh
8:16
you should be able to Super like a profile or you should be able to see the
8:21
likes like who which profiles have liked you and then you should be allowed to rewind the profile like in in case you
8:27
left swipe someone and you want to rewind the profile and like them again or even like if you want to see their
8:33
profile so that should be a possible feature but as far as I remember these features are available only for premium
8:39
users so we can possibly ignore it these are not really important for us to create our MVP application like the
8:46
minimum viable product these are not very important features so we can now jump on to the functional requirements
8:52
and lock them now let's jump into the non-functional requirements first of all
8:57
what are non-functional requirements these requirements don't necessarily influence the user's Journey but rather
9:03
it affects the user experience let's say our system should be highly available like it should not
9:10
happen that I am not able to use the application for a really long time right then the system
9:19
should be consistent because if someone is updating their profile
9:25
I should get that information over the time okay now let me know in the
9:30
comments what do you think should the consistency be eventual consistency or strong consistency what does eventual
9:36
consistency mean like after some time the information is propagated to you ultimately what strong consistency means
9:43
is that the moment the information is updated at the same moment the information should be propagated to all
9:49
the nodes I really feel that strong consistency must be very harsh for an
9:54
application like this let's say some person updated their profile info or uploaded new pictures it's fine for me
10:01
as a user if I'm not seeing their updated pictures at the same time eventually I will get the updated
10:06
profile info so I don't think there is a requirement to push too hard for strong consistency let me know if you think
10:12
otherwise then minimal latency is really important for applications like this
10:18
minimum latency because it would be a really bad user
10:23
experience if I'm scrolling at a profile and I'm not able to see their pictures or if I am doing a left swipe and I'm
10:29
not able to see the new profile really quickly so highly available consistent minimum
10:36
latency what all other non-functional requirements do you think this application or dating site should
10:42
support let me know in the comments below because I have deliberately missed out on some of them which I will talk
10:48
about in the video further having decided our requirements now it's time to decide what all services will fulfill
10:55
those requirements so let's move on to that part first of all it should be the profile
11:00
service okay now if you look on our requirements
11:05
the profile service should handle the logic for create profile update profile set preferences
11:12
right and yeah obviously definitely like upload pics should also be handled by
11:18
our profile service next should be the swipe service possibly because the user should be able
11:25
to swipe now if you look at our requirements the swipe functionality should should be
11:33
like made available through this service and also the logic behind like when two
11:39
person right swipe onto each other they should match with each other so this logic should also be handled by the
11:45
swipe service now if you notice one thing we missed Upon A crucial
11:50
functional requirement which was recommendation something happens behind the curtains like the user doesn't see
11:57
the recommendation service working but the application the system does work on
12:02
some recommendations based on the user preferences that you had set while you are creating your profile so
12:09
recommendation service is something which works behind the screen
12:15
and this should make sure that we get the profiles that we are looking for
12:20
like the purpose of the recommendation system or the recommendation service is to show us the profiles which we are
12:27
most likely to write swipe on so that logic will be handled by this service and lastly the chat service because when
12:35
two people match with each other they would want to chat with each other for this particular service I would really
12:41
love if you have some background about networking or some communication protocols don't worry if you don't know
12:47
we will discuss them in detail as well but I would really love if you do some homework before we jump onto the chat
12:53
service portion so now let's jump directly into our profile service designing we will be having a lot of
12:59
healthy discussion regarding some of the design choices that will make as a part of this profile service so let's move
13:06
okay we already designed the services so profile service first of all there will
13:13
be a client I think my handwriting is improving over the time then we will have a profile service
13:24
okay so the first thing that the client will want to do is to create a profile
13:31
they will pass in the username and the password and this information will be
13:37
stored in a database over here so yeah we can use a SQL database we can
13:44
create cache over it those all are the stuff that I am not going to go deeper into because I have already explained
13:50
how you can use cache and all of those stuff in one of my previous videos where I talked about the system design of
13:56
Twitter so do take a look at it to understand how we can reduce the query time and all those
14:02
stuff using the caching services so we will create the profile the profile service will be
14:09
capable of doing that now let's say we want to update a user profile so let's
14:16
remove this part now let's say we want to update it okay
14:23
so we will pass in the user ID and the info that we want to update
14:30
now if you take a look at this there is no way of authenticating like how do how does the system know or how does the
14:37
profile service know that the user ID whose information I want to update is my own so we will like need to pass in the
14:45
password or some sort of thing like that along with this and here there will be some
14:51
authentication system which will check if like the user ID that I have passed in is actually my
14:57
user ID now I forgot to tell you some things like if you actually use a dating application you will see there are a lot
15:03
of other authentication mechanisms like you can log in through Google you can log in through Facebook and so on so
15:09
there are some external authentication Services which you can use
15:15
for two Factor authentication if you have used like your OTP goes to your mobile phone and then you pass in that
15:21
OTP to the application so there will be an SMS Service as well
15:26
ok but for the sake of clarity I don't want to add a lot of things to this particular service because it takes away
15:32
the essence of the stuff that I really want to discuss okay so okay we'll reduce the size of the Eraser first of
15:38
all yeah so we'll not dig it much deeper into the external authentication
15:43
mechanisms or the SMS service let's keep it fluffy let's keep it natural now a
15:49
healthy practice is not to store the password directly into the databases so instead of password what I would prefer
15:55
is to use something known as tokens so tokens is very common in the authentication mechanisms I'm not going
16:02
to go deep into the like cryptography and all of that so let's take away that portion away
16:08
tokens so the actual implementation happens through something known as JWT
16:14
which is known as Json web token again I'm not going to digress away from this topic by going deep into what JWT
16:21
actually means so we are going to use tokens for the authentication purpose now let's assume there is some other
16:28
service let's say there is chat service chat service wants to know if you are the user ID who wants to communicate
16:34
with their match so they will want to interact with the profile service because the authentication module or the
16:40
authentication mechanism is a part of the profile service let's say chat service is fine let's say
16:46
we add a few more services as well we don't want to repeat the logic we don't want to interact like we don't want all
16:52
of these services to interact with the profile service that takes away the
16:57
entire essence of microservices because microservices are meant to handle a
17:03
particular logic if all the services are interacting with the profile service it's not a good design system
17:10
so we will modify the architecture a little bit let's keep a profile service over here
17:18
and in front of the profile service we will have something known as a routing mechanism or as some people love to call
17:26
it Gateway service okay so the Gateway service will handle
17:32
the request coming from the client and then route it to a particular service it can be profile service chat service
17:39
swipe service recommendation service or anything okay this is a very neat design you know
17:45
why let me know in the comments but otherwise I think it's very neat design because it abstracts or
17:52
encapsulates all of the services the client doesn't need to interact with Individual Services the client just
17:59
needs to interact with the Gateway and no other service will interact with the client only the communication will
18:05
happen between the client and the Gateway service that's the beauty of it so this Gateway will be responsible for
18:13
communicating with different services now having designed the high level
18:18
infrastructure or the system design of profile service let's take a look at how we are going to model the data
18:24
we are going to design the SQL table for the user
18:29
for that we will have user ID as the primary key
18:35
we will store age preference location [Music]
18:41
and other details related to the user now the important question which I want
18:47
to ask all of the viewers is where should we store the images because if you remember the profile service handles
18:54
the logic of uploading image or updating image and so on so how should we store the images should we store it in the
19:01
same table like should we store image one image 2 and so on or perhaps we can
19:09
create a more normalized version of the table like we can create
19:14
a new Partition a new table which will store images we will have user ID we will have image ID
19:22
and we will have the image over here and instead of storing instead of
19:28
storing the image in this user table we can have an image table where we will
19:34
store the image ID instead of the entire image in the user table I think the later one is a more flexible
19:41
opinion it keeps the user table a bit lighter but one issue that can come up
19:47
with this design is that it might require multiple lookups like for example if a user wants to see the
19:54
profile image of a particular user we will need multiple lookups we will query the user table then the user table will
20:01
query the image table and then return the image it can be a little heavy it
20:06
can be very expensive operation so we will decide how we can work upon this
20:12
particular question of where to store the images should we store in the same data store or we can store it in the
20:18
form of a distributed file system and so on don't worry if you don't understand the technical jargon we will discuss the
20:24
pros and cons of each of these approaches and then we will make a call what system we are going to use for our
20:31
dating application now the question that was really important which I wanted to emphasize on
20:37
how are we going to store the images now we consider two approaches in the
20:42
previous slide storing it in the same data store
20:48
it will be in the form of blobs now to those who don't understand what
20:53
blob is it stands for binary large object it's just zeros and ones like the
20:58
image is stored in the form of binary large object which is zeros and ones in the same data store we have two choices
21:04
either we can store the entire image all the five images in the same user table or we can store it in the different
21:11
image table and then create a reference in the user table for that another option is file system
21:18
now before we take a call of our preference between both of them it's
21:24
important to understand the pros and cons of each of this choices now let's
21:30
see what does the data store have to offer us the first thing is transactions
21:38
these are the atomicity like the database provides us the atomic structure all the transactions happen in
21:44
one go together then it's the mutability
21:53
it allows us to update the images delete the images update a part of image and so
21:59
on do we actually require this we are going to discuss this further then it provides us an opportunity to
22:06
index this is usually used for search operations
22:12
we are not going to search over the images so this particular offering may also not be required for us to store the
22:19
images and the last one which is very important one which I want to highlight is security
22:27
or the access controls like the same security offering which is provided to the user data the same offering is
22:34
provided to the images as well which is a pro of storing it in the data store same data store
22:40
now as we discussed we don't need the indexing offering because we
22:46
are not going to search on a portion of an image or we are not even going to search on the basis of image we are
22:52
going to search possibly based on the age range or any of the user preferences that we have set
22:58
so index indexes are not actually required to store the images
23:04
mutability is important because we are going to update the images but we can do one thing like we can create a new image
23:10
we can create a new file and then delete the old one so in this way we don't actually use the mutability feature of
23:16
the data store we are not going to update some part of the image so that is also not required
23:22
now transactions atomicity is also not required because we can update the image
23:28
or delete the image asynchronously it doesn't need to happen in a single transaction so we can
23:34
get rid of this as well security is important but we will see how we can manage security in our file system as
23:40
well if such a possibility arises here we discuss the pros of using a data
23:46
store now let's talk about some of the cons which might influence our design choice
23:51
so the first con is that multiple lookups which we already discussed before
24:02
so this can be actually an expensive operation like if we are going to query the images from the data store and
24:09
send it to the client from a SQL database so this is going to be very expensive
24:14
which is a very important con which we need to consider while making our design choice the
24:20
second con is discourse take a lot of time okay the image if the image is very
24:27
large it's going to be stored into multiple blocks within the disk those who don't understand what I just
24:33
said take a course on the databases or database Management Systems which will
24:38
help you understand how the image is stored into blocks which are a part of this system so when
24:45
you query multiple disk if your image is stored in multiple disks you need to
24:50
query different blocks from the disk and querying different blocks from the disk
24:55
is a very expensive operation if you remember disk iOS are really expensive we cannot afford multiple disk iOS for
25:03
the lookup operation
25:11
so this is part of multiple lookups only and this will also influence our design choice
25:17
now the next thing to remember is a data store click create some replicas
25:22
when you create a replica let's say you are storing image
25:28
a user has five images and let's say each of them cost two MB tools now let's
25:34
say there are millions of users can you calculate for me and tell me how much
25:39
space will be utilized to create a replica and just imagine how much time will it take to create such a big
25:45
replica replicas
25:52
also costly let me know in the comment section after
25:59
you perform the calculation 2mb image five images
26:06
and million users okay here we are talking about the active users there can be more than
26:13
million users so all of these cons really influence our design choice now
26:18
let's take a look at some of the pros which are offered to us by the file system
26:25
we can create a CDN okay I will explain what CDN means but let's say we have a
26:32
distributed file system we can create a CDN on top
26:37
of it
26:47
this is known as content delivery Network which helps us to Cache the
26:52
images if a user is going to query them multiple times so this actually makes the lookups much faster as compared to
26:59
data stores where caching the images will also be very costly because we are storing the images in the data store we
27:05
are also storing them in the caches so it's really expensive for us as a part of DFS we are going to store
27:11
them as in the form of file system we will store the file URLs along with the
27:16
user info let's see how it looks in our data store
27:25
we will have user ID we will have
27:31
image ID
27:36
image ID and then we will store the file URL now
27:43
this image ID will be stored in our user table and
27:49
from that we will reference the images so if you want to delete a image or update an image create a new file and
27:55
then delete the old file yes it may create some issues of dangling images wherein we are not actually referencing
28:01
a deleted image and we forgot to delete that image so we really need to make sure that our mechanisms are in place so
28:08
that all of the advantages of a data store are actually fulfilled by a file
28:14
system yes it can be a little bit tedious but it is still manageable so I think a distributed file system is the
28:21
right choice for us to store the images and let's see how our
28:26
ultimate profile service will look like now I really believe that we can create
28:33
a new service we can spawn a new service to handle all the image operations because if we store all of these
28:40
operations inside the profile service it will be very costly let's say there is a new
28:46
possibility where we can use the images in our machine learning model to let's
28:52
say calculate the beauty of a picture or something some way to recommend a better suggestion better profile to the user
28:59
then we will require to query the images so for this we can create a new service again there is no hard yes or no it's my
29:06
personal preference we can create a new service which is the image service
29:12
and let this handle all the image related operations so there will be a
29:17
distributed file system over here which will it will interact with and then we'll create a database where it will
29:25
store the file URL image ID and the user ID and this will be referenced whenever
29:31
someone wants to carry the images the Gateway service will reference from the image service instead of the profile
29:37
service so it may require two calls to the profile service and the image service but I think decoupling them is a
29:43
healthier option as compared to merging everything in the profile service let me know if you think otherwise we can have
29:48
a healthy discussion in the comment section now we have completed the design of our profile service we took some
29:54
rational calls we made our own personal decisions it can be right or wrong it's very subjective now let's move to
30:03
swipe service so when a user swipes left or right this swipe service will handle
30:08
the logic if you are going to match with a person or not this service should handle that logic
30:15
now this is a client do you think we should store the swipe information with the client itself
30:22
rather than storing it in server can you let me know what are the cons of this approach the first con which I can
30:28
imagine is if I am storing all of the likes and dislikes with the client I
30:35
have no way to identify on my own as a client if I matched with a person or not I should be communicating with the
30:41
server to let the server know that okay this is my right swipe can you let me know if the opposite person has also
30:48
right swiped me or not so ultimately the server should be the source of Truth
30:53
rather than me making the decisions on the client side so I think it's a very healthy practice to store that
30:59
information in the server itself let's complete this design
31:06
this is a gateway service this is our swipe service
31:22
now what will be the ER model what information are we actually going to store in the data store as a part of the
31:28
swipe service there can be multiple options none of them are right or wrong it's just some decisions that we take
31:35
based upon the requirements so what I have decided or what I am thinking right
31:40
now another issue which I think can come up if we are storing the swipes left and
31:46
right with the client side is that let's say I uninstall my application I am going to lose all of my swipes and with
31:53
that I also lost all of my matches for some reason in the future if I come back
31:58
on the application again there is no way for me to connect with my matches this can be a really very bad experience for
32:06
me so I actually want to store the match information in the data store itself
32:11
let's take a look how we will Design our data store
32:17
we can keep the information of user IDs user ID 1 user ID 2 and then we can
32:24
actually check if one liked to liked
32:30
and so on don't actually name your variables in this way this is just for the purpose of
32:37
the video so make sure that you follow the proper nomenclature whenever you are preparing your ER model
32:44
what will happen is when one likes the profile of 2
32:52
here one liked
32:57
shows true okay now when two also likes one
33:03
it means two light also becomes true this is a way for us to ensure that okay one and
33:11
two have matched with each other if both of them have the value true if one of them have the value false then it means
33:17
that one of them have liked but the other one has not liked now with this ER model do you think we are actually
33:23
storing the information of our left swipes if two users both of them have left swiped onto each other do you think
33:31
we are going to store that information in our ER model I think we are losing the left swipes
33:36
and I don't think it's a very crucial information that we are losing on because if I'm left swiping a profile
33:43
and I get the same profile again and let's say I change my mind for some reason I should be allowed to have
33:48
another opportunity or even multiple opportunities in that case to match with that person or at least right swipe the
33:54
other profile so this service will be responsible to let us know if a user 1 has matched with
34:02
a user 2 or not this service is going to be consumed by a lot of other service can you let me know in the comment
34:09
section which all services will be consuming this service if you are looking to chat with your match after
34:14
you have matched with a person this service the chat service will want to know whether you have matched with user
34:20
2 or not in case you are trying to chat with user too you are user one in this case so the chat service will interact
34:26
with the swipe service to get the information about the match now let's say you want to look at the
34:33
profile of the user to who you have matched with so the profile service will want to know if you are actually allowed
34:40
to see the profile of user 2 or not so the profile service will also interact with the match service and the match
34:47
service will return a true or false in a Boolean way to let the profile service know that hey it's okay for user1 to see
34:53
the profile information of user 2. you may just want to look at the likes and dislikes of the person the interest of
35:00
the person or just randomly stock the profile of your match now we have
35:05
already designed two of the service out of the four profile service and the swipe service which service should we
35:11
designed next my heart really says recommendation system but I think it's really complicated to explain it at this
35:17
moment so we will keep it for the later and go on to the chat service
35:24
now let's say you are user one you match with the user too and you want to chat with that user
35:34
we also have a user two how will both of them communicate with
35:39
each other we have Gateway over here
35:45
user one would be like a Gateway can you send message to user to
35:51
Gateway would be like how do I know if you have actually matched with user 2 remember the swipe service which we just
35:58
recently designed yes the Gateway can directly communicate
36:04
with the swipe service and then forward the message
36:12
to user 2. do you think it actually works in this
36:18
way I feel that we should decouple the logic of Gateway actually taking the decision
36:24
whether the message should be sent to user 2 or not so for that purpose let us
36:29
create a new service which will handle all of that logic so instead of Gateway actually
36:37
communicating with the swipe service we will let Gateway communicate with the chat service and rely on the chat
36:43
service to ask the swipe service if user 2 and user 1 have actually matched with
36:49
each other or not once the swipe service says let Hey like user one has matched
36:54
with user 2 allow it to send the message to user 2. but an important thing to remember here
37:01
and I really hope you didn't bunk your networking classes because we are going to talk about some of the communication
37:06
protocols okay let me ask you a quick question what is HTTP I'm not asking you
37:12
for the full form because you obviously know that hypertext transfer protocol but what I mean to say is that it's a
37:20
client server communication protocol where the client sends the request to the server and the server doesn't ask
37:26
the client that hey client do you want to ask me anything the server just sends the response to the client so in this
37:31
case do you think that the Gateway will actually query the user to saying that
37:37
hey this is the message that you have got from user one that's not what HTTP does here we have a different protocol
37:44
which is known as xmpp so obviously we are not going to send
37:52
the message to user to directly we are going to communicate through the
37:58
exam PP protocol which is the peer-to-peer communication protocol here there are no differences between client
38:04
and server all of them are equal there is no discrimination between the client or the server
38:10
so with this peer-to-peer protocol the Gateway can actually send the message to the user too otherwise
38:16
imagine what would have happened like if we were communicating over HTTP user 2 would be like hey did anyone send me a
38:22
message just like I keep checking my mobile phone every five seconds to see if I have got the message from the one
38:28
or not so this is not actually like this is very expensive so user 2 is not going to
38:34
pull the Gateway saying please check if you have got any message for me instead we will use xmpp protocol which will
38:41
directly send the message to user 2. but an important piece of information over
38:46
here is that the user 2 will be listening to the Gateway
38:52
through something known as web sockets okay user one will also be listening
38:58
through websockets if you don't understand what are web sockets let's keep it simple
39:03
let's say there is a TCP connection between the users and the Gateway okay all of the users have some way of
39:11
communicating with the Gateway and it is persistent since we are using a TCP protocol
39:17
or you can create your own protocol as well if you are interested in it but for the sake of Simplicity let's stick to
39:22
TCP protocol all the users will be listening through
39:28
this TCP protocol and what the user one has to do is to identify what connection
39:34
the user 2 is listening on so this is where the real beauty of chat service comes into play the chat service will
39:41
hold the information about the connections of each of the user like what connection the user is listening to
39:48
so let's say our user or user 2 is listening to C2
39:56
and a user one is listening to C1 so we will hold all of that information in our
40:02
data store which will have user ID and connection ID so what the user one
40:11
has to do is to identify the connection ID of the user 2 to which it wants to send
40:16
the message but it definitely can't do that so that will be the task of the chat Service chat service will get the
40:23
user ID of user 2 and it will query swipe service to let them know that whether the user one has matched with
40:31
user 2 or not once they get a positive response that okay user1 and user 2 have matched it will query the database to
40:38
identify the connection ID and then transfer the message to user 2 through the connection ID to which it is
40:44
listening so this is the entire flow of the chat service user 1 will send the
40:51
message to user 2 using the user ID which the chat service will query from
40:57
the swipe service to identify if they matched or not once it realizes that okay they both have matched it will
41:03
query the database to get the connection ID to which user 2 is listening and then
41:08
send the message or queue the message to the connection to which user 2 is listening and then the user 2 can keep
41:15
pulling from the connection to which it is listening this is all about the chat service design
41:22
now let's move to the most crucial part which I want to emphasize from a really
41:27
long time which is the beauty of dating applications it's the recommendation
41:32
service now let's move on to the recommendation service recommendation service can also
41:39
be called search service because in front of the screens when you are doing right swipe and left swipe what the
41:45
system actually does is that it searches for the profiles in its data store which
41:50
you are most likely to write swipe on so we can also call it search service if we want to it's also shorter to write
41:56
the search Logic is actually influenced by the user preferences if you remember when you created the profile you added
42:03
some user preferences age gender orientation location and so on so all of
42:08
this user preferences are going to influence our search service or the recommendation model in some way there
42:15
are two categories in which we can distribute our preferences
42:21
hard preferences and soft preferences what do I mean by
42:26
hard preferences is that let's say I have set a constraint of age preference to be 20 to 24 so I really don't want to
42:33
see any profile outside this age range okay it's going to be really bad user
42:39
experience if I see a profile of h26 or 18 or so on because that's what I'm not
42:44
looking for so age is a hard preference location is
42:49
definitely a hard preference because let's say I have set a location preference to be 10 kilometers because
42:55
of some reason because petrol is costlier now I don't know but I have set up some preference based on the location
43:01
so I really don't want to see any profile outside of my location preference so location is another hard
43:08
preference and lastly gender orientation
43:14
let's say I have set a gender orientation for female just imagine my user experience if I was shown a male
43:20
profile it's not healthy and I would definitely want to uninstall the
43:26
application at that particular moment so I think these are the hard preferences age location gender orientation and so
43:32
on I don't think there are any other hard preferences talking about the soft preferences which don't actually
43:38
influence what profile should be shown but rather how they should be ranked for example what my interests are
43:47
let's say I am interested in tracking so I don't mind if someone doesn't have
43:52
that particular interest but definitely if someone has an interest in tracking that profile should be shown on top of
43:58
the other profiles what are my hobbies what are my interests what is my career path right
44:03
now let's say I'm a software engineer so I don't really mind looking at the profiles of people who are not software
44:09
Engineers but if they are a software engineer then it can really influence our recommendation model
44:15
so there are a lot of other soft preferences will not go into detail in
44:21
each one of them but the important thing to remember for the recommendation model
44:26
is that hard preferences filter which profiles should not be shown at all and
44:32
the soft preferences are responsible for the ranking of the profiles that are shown to you so how are we actually
44:39
going to use this hard preferences to filter the profiles that should definitely not be shown to us
44:46
one of the ways is that I can query a SQL database and there I can put where conditions where gender orientation
44:53
equal to female where age equal to 22 or 23 or 24 and so on but this will be very
45:00
expensive for example imagine for the location you will need to compute the distance between your location and the
45:06
location of the other user and then take a call if that profile should be shown to you or not so this is not a good
45:13
practice another way in which you can do this is through indexes you can create
45:18
index on each of these hard preferences age location gender and so on but one
45:24
thing which people forget is that when you have multiple indexes the query is
45:30
optimized only for one of them let's say you have created an index on age so
45:35
using the hierarchical structure of a tree you will filter out all the profiles which are out of your age range
45:41
preference but what about location and gender once you have got those profiles you really need to perform those
45:48
calculations on your own to extract the profiles matching your gender orientation and your location
45:54
preferences so this is again a costly operation because your query Optimizer
46:00
you can tell your query Optimizer that hey optimize for this particular hard preferences for this particular
46:05
dimensions and it is up to your database to decide which index it should actually
46:12
search for so that is a little bit out of your control you cannot it's not flexible enough for a developer to
46:18
decide which index the search will actually be performed on to get rid of this issue we can use a
46:26
distributed nosql database something like Cassandra or dynamodb by AWS or
46:33
something like that now let's say I'm not very comfortable using a distributed file system
46:39
distributed database or possibly I have a preference orientation I am more
46:44
comfortable towards a SQL database then we have an alternative for that as well we can use a SQL approach with a concept
46:52
known as jio sharding sharding based on locations now let's take a stop to
46:58
understand what sharding actually means
47:04
so what does charting mean sharding means that we distribute the data based
47:10
on the values in a column let's say we have a column name username so we will distribute the values from for example
47:18
a to m then what comes after m n okay n2s and then T to Z so let's say
47:27
we have partitioned our database into this three different shards so all of these three different shards will have
47:34
one node which will respond to it let's say this is node one this response to node 2 and this
47:42
responds to node 3. for example let's say someone is
47:48
searching for anshul so they only need to identify which Shard they should be calling they will be calling Node 1 and
47:55
hence our data store will be divided in such a way
48:00
that all the user profiles having the names in the range a to m
48:05
will respond to Node 1 all the names which are in the range of n2s will
48:12
respond to node 2 and all the names which are in the range t2z will respond
48:17
to node 3. so this is one way of sharding where we used username to Shard our data
48:23
but what happens if Node 1 crashes will we stop responding the user profiles
48:29
which are in the range a to M this will be a horrible user experience because I don't want someone to search me and not
48:36
return my profile we can use a concept known as Master Slave architecture wherein along with
48:44
Node 1 which is the Master Slave we can have a slave node which is node two so whenever
48:51
Node 1 which is the master node crashes we can use the slave node to respond to
48:57
the queries for the username in a to M now you will ask what if the slave node also crashes
49:03
okay this is a question for you all let me know the probability where both the
49:09
master node and the slave node crash at the same time it's really really low
49:14
and there is no anticipation of such an opportunity so we will use a Master Slave
49:20
architecture and geoshard our data now let me explain what Geo sharding would actually mean
49:26
let's say this is the map of some location and we will divide the entire map into
49:33
grids
49:39
now each one of this chunk okay all of this chunk correspond to a particular
49:44
node let's say you are located in this particular chunk
49:50
so what you actually need to do when you are performing a search operation is that you want to return the profiles
49:57
within your location preference so you would be searching within this particular node and all of these
50:02
adjacent nodes now the size of each of these grids will actually vary upon what
50:08
is the maximum location preference which is given by the dating application or which is given by the system let's say
50:15
you are allowed to add a location preference of 50 kilometers for example I think the grid size of one kilometer
50:23
by one kilometer is very helpful in that sense you can perform a breakfast search kind
50:29
of a search operation where you move from adjacent node to the next adjacent node
50:35
and identify if they actually fall into the location preference which you have added now when those profiles are
50:42
returned to you you can perform a filter based upon the age preference and the gender preference location preference is
50:49
a trickier option to calculate and that is the reason we are doing Geo sharding and not age sharding or gender sharding
50:56
or something like that now let us consider some other use case
51:01
let us consider the jio shards for India and us what will be the activity of those
51:07
geoshards let's say this is the graph for
51:13
India and this is the graph of us
51:19
now this is the time axis
51:24
and this is the activity axis
51:30
so during the day time or during a particular time okay let me
51:36
mark them as well India and U.S
51:41
so when the geoshars of India have very high traffic the geoshars of us will
51:47
have relatively low traffic and vice versa when the geoshards in U.S will be at their Peak the Geo shards in India
51:54
will be at their lowest traffic so now what we can do is that we can create
51:59
same Geo shards we can use the same geoshards for both India and us so that
52:04
we have proper resource utilization and at no point in time does our resources
52:10
remain unutilized but now one problem will arise because of the same geoshards for example in
52:18
European Union you are not allowed to store the data of a user outside European union or EU
52:25
so this will create some sort of issues if we are going to use the same geoshards for different continents
52:31
particularly EU experimentally it has been found that if
52:36
we randomly distribute the Geo shards across different geographical locations it gives a decent enough response rate
52:44
and the resources are properly utilized but for some special cases like EU we
52:49
cannot perform this random distribution of Geo shards now another use case is coming to my
52:55
mind where we can still optimize let's create the grids again
53:04
now let's say all of these grids don't have the same number of users for example this grid has 10 users this grid
53:13
has similar number of users but when we come to this chunk
53:18
it has less number of users for example let me just fill up something
53:27
ok so what we can do is that we can actually merge all of these chunks into
53:32
a single chunk and then dynamically geoshard based upon the number of users
53:37
in that particular grid so that all the grids have similar number of users now
53:43
you will ask me what if it exceeds our location preference but remember irrespective of the size of the grid
53:49
they are holding similar number of users so even if you query a bigger chunk it
53:55
is going to have around 10 users for example and then among those 10 users you can perform the location calculation
54:01
on your own identify the distance and filter based upon the distance and the
54:06
location preference that you have set this concept is actually in terms of
54:11
computer science technical jargon it is actually called quality I am not going
54:17
to go deep into what quarterly actually means you can check it out search it over the web and let me know what quadri
54:23
actually means and how you can use that data structure to optimize the dynamic
54:29
Geo sharding feature that we discussed about now these are some of the random
54:34
optimizations which just floated into my mind let me know if you have some other optimizations or how you can optimize my
54:41
optimizations as well what data structures you can use what algorithm can be used to tweak and optimize it
54:46
further let's take a look at what the ER model
54:52
for the recommendation service look like we will obviously be storing the user ID
54:58
and we will be storing the grid ID as well now based on this grid ID we will
55:04
identify the adjacent grid IDs perform a search over that filter based upon the
55:10
age and gender orientation and then use some ranking models to integrate it with our interest our Hobbies my career
55:17
position and so on and then return those profiles to the user
55:22
let me I don't think I really need to draw the diagram of the recommendation service because this is the database
55:28
that we are going to use with it let me just summarize it how our entire Tinder
55:34
or let's say dating application system architecture look like we have a client
55:42
we already talked that the client will communicate only with the Gateway
55:47
service now there are different
55:53
Services which our Gateway service communicate with
56:00
chat profile
56:08
search I am not going to type sorry I am not going to write recommendation completely and the last one being the
56:16
swipe service I am not going to draw all the ER diagrams and all of them complete
56:21
this diagram as an assignment how each of these services will interact with each other for example if you remember
56:28
I talked about chat service interacting with the profile service or the search
56:34
service interacting with the profile service and so on okay oops I revealed one interaction which I didn't mention
56:40
and I was expecting you to answer that it's okay let me know what the complete
56:46
system architecture look like how will each of these Services interact with each other and if you have any doubt do
56:53
let me know in the comment section and I will be happy to assist you in the hood behind the hood in Tinder it
57:01
actually uses elasticsearch based upon the leucine indices for each of this hard preferences I am not going to go
57:08
deep into what elastic searches what Lucid indices are and how actually Tinder performs the recommendation
57:15
system and the entire system architecture so we all definitely know that Tinder
57:20
was not developed in 40 45 minutes the real motivation for me for this video was to make sure that you are aware
57:27
about some of the important computer science fundamentals which are really used in system design we talked about
57:33
some communication protocols through networking we talked about how we can store images either as blobs or in file
57:39
system we also talked about some Concepts like jio sharding and so on I know all of this technical jargon can
57:46
scare you make sure you do some self-study and if you still have some doubts put it in the comment section
57:52
below I really hope this content was very informational for all of you if you
57:57
loved this video make sure you give it a thumbs up also don't forget to subscribe
58:02
to scalar's YouTube channel and make sure you hit the Bell icon so that you never miss on such amazing content in
58:09
the future