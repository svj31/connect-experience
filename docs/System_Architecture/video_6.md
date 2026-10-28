0:06
video on my channel one video on his channel so you can check out the entire series the link to the series will be in
0:12
the description so we'll keep creating a lot of videos on different different topics and these will be common
0:18
questions as well as sort of different questions that you know you don't see solutions to so much the first one today
0:25
is going to be on disappearing messages so if you send someone a message and you want it to stay only for 24 hours or if
0:32
you wanted to stay only till they have read it this is something common in Snapchat Instagram that's the high level
0:38
design that we're going to be talking about today so let's start this
0:46
[Music] series say that we have Snapchat
0:51
downloaded by a customer so let's start there we have a person
0:58
with chat on the mobile and then they are sending their disappearing message
1:05
to their friends who are across the border and what they want to do is they
1:10
want to make sure that this message is deleted after it is seen so how should
1:18
we go about doing this let's start with just two cell phones uh and let's start with you know you always need a server
1:24
if you're going to send a message or if you're going to do anything I have a couple of questions uh Gab so just to
1:30
set the requirements correct okay yes I know like just setting up the function requirements correct I know that our
1:37
main requirement is definitely disappearing messages but then I also wanted to ask that are we going to take
1:43
care of group messages or only on one to one messages because the way we handle group messages will be very different
1:49
let's start with the easy part which is one to one messages uh and we have to
1:54
make them disappear and then we can go for slightly more complex things how to extend it we have to basically make it
2:01
extendable then secondly when we say disappearing messages it is just disappearing after a time period or uh
2:08
is it like once it is seen then it is disappearing so we can go for the most easy one which is it disappears just
2:15
after you see the message and later on we can go for more complex things like time based uh disappearing messages yeah
2:22
actually once you see would be more complex for group chat and time base would actually become easier but okay
2:30
cool right yeah yeah let's we can go for either but I think let's start with uh
2:35
you see and it goes away because I think that's the more common uh use case
2:41
correct all right all right cool right okay okay so there are two major ways of
2:47
handling this right that we handle this on the client side or on the server side we'll obviously be trying to solve it on
2:53
the server side right like not everything we are leaving on the client side yeah I think some part we'll have
2:58
to leave at the C but whatever we can manage on the server
3:04
or whatever we need to manage on the server we manage on the server right so let's let's start with the most basic
3:11
part then um these are parts that I think most of us know if not then you
3:16
can watch uh a WhatsApp system design video that I have which is on one to one messaging I think K has also explain One
3:24
to One messaging quite well um K is there any video that we can refer to
3:30
L description yep yep there are there are actually two videos one I'm explaining to my father that how
3:36
WhatsApp works so that is also there but yeah yeah what you eventually want to do is let's say k is sending a message to
3:42
her dad and the message needs to be deleted in sometime because U her dad is
3:49
at a party and then you don't want these private family messages to be seen also another UC for disappearing messages in
3:55
family chat especially is because so much chat is generated every day good morning messages and all that stuff that
4:01
you actually want to get rid of it you don't want your system to be clogged up your client device to be clogged up with
4:07
all of these messages so I have often seen family chats having like disappearing messages there's nothing important over there that you can't lose
4:13
there's no need of History so a message is going from one place to another but
4:19
this is impossible to do because K's cell phone doesn't know where her dad's cell phone is okay I'm taking this use
4:26
case uh instead she needs some sort of router uh uh and in our case because we
4:31
are providing this service we have Snapchat or we have Instagram this is the backend chat server which is somehow
4:39
going to Route this message to this mobile device that is our basic
4:45
requirement now this itself means quite a few things one of the things is there needs to be a way for EP cell phone to
4:53
find this server that I think we can assume that the uh DNS is going to
4:59
manage that if you have a URL Snapchat SL message slash your username and so on
5:05
that URL can be hit we are not worried about that after that how do you find
5:11
the destination this is a from device this is the two devices when you are from so uh the
5:18
answer to that is you need some sort of routing again uh that has to be maintained by tables so maybe you have a
5:28
database which has every person's IP address yeah you have uh the
5:35
destination IP address the mobile IP address stored over here storing adding
5:41
one point over here uh so how does like basically chat server communicate to the
5:47
mobile right so that is one thing so how is this networking happening is it a normal rest API call and just making uh
5:55
the audience also think uh it can also be over a websocket connection right that because there going to be a lot of
6:01
messages we do need a full duplex connection it does make sense to have a websocket connection so this IP address
6:08
database that you're talking about it could also be like a websocket connection Handler that is basically
6:15
storing that which mobiles like I have the websocket connection to which chat servers because there will be multiple
6:21
chat servers and we have websocket connections with them right so yeah yeah
6:26
makes total sense makes sense yeah uh the that's a really good point actually
6:31
because we uh we can use HTTP here to send the message so that would be a client to server thing and we can also
6:38
use HTTP to receive the message basically the destination phone can keep paying the server saying that hey do you
6:44
have any new messages from me every 5 Seconds similar to how email keeps pinging so but you don't want that uh in
6:52
Real Time Communication it's also very wasteful every 5 Seconds you're messaging despite there being
6:58
potentially no messages uh you know on the server so if you had a fully duplex connection like K mentioned it's awesome
7:04
because you can send and receive messages so it's two-way complication the one that you were talking about was
7:10
basically polling uh long polling or short polling but then uh why do that right so web socer connection makes
7:17
sense makes sense Al so you uh have this now database which is not storing IP addresses but it's storing uh a
7:24
connection it's a connection Handler it can tell you where a person is connected correct internally it's probably going
7:31
to be storing some connection information whether it is IP address or it's some connection information that
7:38
you can rout yeah that's interesting you mentioned Port because in this chat server maybe you're receiving messages
7:44
on one port and maybe you're emitting messages from another Port so yes the
7:49
same application can be using different ports so okay K I see that you have drawn a load balancer so we are already
7:56
having at least 10,000 customers I guess yeah Snapchat WhatsApp yes they have
8:02
more than 10,000 okay so could you explain to us what this load balancer does so basically there are going to be
8:09
different chart servers right so obviously there's going to be a reverse proxy like how do you know that with
8:14
like DNS is there I know but there's not just one chat server right there are multiple chat servers and this is not
8:20
the only uh request that we going to get they're going to be multiple requests so you could also see it as an API Gateway
8:27
basically I just added a reverse box which can be a combination of load balancer and API Gateway okay okay so
8:35
this load balancer is going to be taking our messages and it's also is it going
8:41
to have web sockets connected to it so I don't think we should be connecting to load balancer but since I said it can be
8:48
a combination of API Gateway but I think connecting it directly from chat server does make sense right like yeah and so
8:55
if we have a very small system one chat server can manage uh yeah I think having a load Balan makes a lot of sense if you
9:00
have a DNS here which has addresses to all these chat servers uh that is
9:07
possible but then DNS based load balancing better than that you having control by having your own custom load
9:15
balancer makes total sense okay so we have this load balancer which connects to different chat servers I think having
9:22
websocket connections here is is good uh we can have a load balancer which has
9:28
yeah and we then have a chat server three chat servers very nicely aligned
9:33
okay there is a bit of a problem now uh what if the source mobile uh maps to
9:40
this chat server this request goes here and is it possible that you're sending
9:46
chats to what is the purpose of having multiple chat servers we should have multiple balances
9:51
I guess we should have multiple load balances because every machine can have
9:56
obviously limited number of web socet connection like limited number of ports or limited
10:01
number of web soet connection so how I saw like load balancer basically instead
10:07
of having the websocket connection with the load balancer you could also have within API Gateway which is attached to
10:12
the Chart server so instead of exposing the private IP of the CH server you're basically exposing of the API Gateway
10:19
now load balance is just to distribute the load but the web socket connection is actually with the API Gateway which
10:25
is like basically with the chat server so that is how I was thinking but uh
10:31
it's okay we can have web socket connection with the load balancer as well but then that also limits us to
10:37
that uh there are going to be limited number of connections right so multiple chat servers for those say what 50,000
10:46
60,000 connections I'm not sure if it makes sense the problem is if we have
10:51
HTTP here and let's say web socket here why websocket over here like HTTP
10:56
converted to websocket right so you can have basically directly with the chat
11:01
server like this basically this why not directly with the chat server it is just
11:06
that the first time the request comes it is going to direct to this chart server and then the web soet connection is
11:12
going to be with the chart server itself does that make sense so the load so why is the load what is the load balancer so
11:19
the first time the request is going probably it can go to the load balancer and then it can balance and see where
11:25
should the like this should create the web socket connection which server and then after that there's a full duplex
11:31
connection with the chat server itself then Road balancer doesn't have to be involved so okay so we are basically
11:37
assign a cat server the first time we send a message the load balancer returns
11:43
a chat server that that they need to make a web socket connection yep okay so let's say this is
11:55
the okay is there any other way we can do this uh should
12:01
we consider uh I mean I I see that the load balancer is basically it's yeah
12:08
it's good it's a load balancer it is balancing load it is telling you which chat server to connect
12:16
to uh okay right and then you build a web sofware
12:23
connection with that particular chart do you have any other approach in mind yeah uh
12:30
actually no no this is good uh we have a load balancer and the load balancer is
12:35
literally just balancing load which is just also this web socket connection Handler so basically it is sort of like
12:42
a address datab like sort of a map as you had initially said so it does make sense to probably use a key Value Store
12:51
like radius which also gives us persistence but uh is also
12:58
fast okay so you you want to Cache this these
13:04
IP addresses yep y makes sense okay so now um here's the interesting part uh
13:11
how does a person send a message from his mobile to this person like how does
13:17
the chat server know where to send it correct so let's sa on Flow like suppose
13:22
from this mobile we have a websocket connection to this chat server right suppose this chat server is two and now
13:29
suppose we have no idea that uh where is this two mobile connected to right so
13:35
for that we basically go to this connection Handler and then we say key
13:40
okay where is this two mobile connected to and then it tells that okay it is connected to this chat server now again
13:46
there are two approaches that uh either this chat server can directly send after
13:53
like knowing ke it is connected to chart server 3 or we could probably sign from
13:58
here or we could add a something like Kafka in between just telling you different approaches the main point is
14:05
that uh this connection Handler is going to tell us key where is to mobile connected to does that make sense yeah
14:13
yeah that makes totally sense you have a person who is connected to chat server too so let's change the color of this so
14:21
that it's easy to understand let's say red and you have from as red and then
14:27
you have uh this person in blue and this
14:32
is also blue now it's clear that we have it has to go from red to blue so when
14:37
does it go it goes from the from Mobile to chat server 2 where it's connected it
14:44
got this connection because it went to the load balancer who knew that you know you belong here uh someone else belongs
14:50
somewhere else okay so the chat server 2 now needs to send
14:55
the message to the destination the way it does this is there are two
15:01
ways to do it one is to go to this IP address table and the other one is to actually just go back to the load
15:07
balancer I'm sorry uh I won't delete that but yeah the other one is to just
15:13
go to the load balancer and check uh where is destination connected and
15:20
whatever response it gets it can use that to to find where to send the message to if we can do that from the
15:26
load balancer itself then th this connection analyst or needed right yeah I guess uh the this connection Handler
15:32
whatever we like to call it uh is yeah yeah so whenever a person wants
15:38
to know where a mobile should connect to mobile a should connect to mobile b u
15:45
this has some sort of a mapping of a belong chat server 2 B belongs to chat server 3 and in that way all the chat
15:52
servers can just use this connection Handler and even the client devices can connect to the connection Handler to know where to connect to if they I'm not
15:59
sure right yep okay I would like to add a couple of points over here one thing
16:06
that suppose A and B were connected to the same chat server then there is no point of asking the connection Handler
16:12
again and again so first thing that the chart server two could cach is that who are connected to itself right so if
16:19
suppose the destination or the two mobile is connected to the same chat server we do not need to keep asking to
16:24
the connection Handler that is one thing that we could cach uh another thing that we could cash is basically the
16:31
frequently accessed like messaged people like for example I message my father a lot then we could probably cash that but
16:39
then with a very less ttf so that even if uh B mobile is supposed connected to
16:45
some other chart server then the TT should be very less right so that we can
16:50
basically update it from connection handle just a few seconds but probably we can make it more efficient like that
16:57
one of the things that we can do is that like you said there's the approach of caching which is perfect right we can go
17:03
for the caching approach another approach is to actually have some sort of a small like a mini you know cache
17:10
inside we can call this a client this is some piece of code so I
17:16
just color the connection Handler differently yellow all right and I I'll
17:21
make this also yellow okay got your point M so now what happens is like you
17:27
said the cache it's for perfect we cach things on the client whenever a person says listen where is mobile B uh the
17:35
chat server has no idea chat server just says client find out where is mobile B and if the client has it cached I mean
17:41
it sends the message to chat server 3 which sends it to mobile B otherwise uh it calls the connection Handler so
17:47
actually this thing is always happening from the client the caching how long does it keep the cache what kind of
17:53
algorithm should you use like you said recently used people so for example if a chat starts it doesn't end very quickly
18:00
this recently used as a good algorithm here because K is chatting with her dad she's going to chat for 10 minutes and once she stops chatting she's not going
18:06
to chat she's not going to chat for a while so it's good to remove her from the server quickly so you can use
18:13
different algorithms here but yeah this is great if a person wants to send a message from one place to another we have a mechanism to take care of that we
18:20
are able to scale this also quite a bit we are able to add servers a single connection Handler is there if you want
18:25
to this is backed by some database somewhere um which is going to keep a mapping of which user is connected where
18:32
right okay I have a question so are uh are we storing the messages or are we
18:38
encrypting it and not storing it anywhere like are we directly sending it to the like to the two mobile and not
18:45
storing it anywhere or are you storing the messages so if it was slack or or some sort of Team communication then it
18:51
would be very important to have it audited because someone says something and later on says that I I never told
18:57
you to that would be very scary but uh in case of this uh the whole like the
19:03
the use case of the application somehow is it doesn't get stored anywhere correct yeah so we are just encrypting
19:09
and sending it right now my another question is yeah my another question is that what if the user is offline like
19:16
for example B is offline right now and we send the message then what happens do we put into Kafka or like what do we do
19:24
yes we will put it in some memory data structure whether it is is but we will
19:30
not give any guarantee that the message will reach so for example KY you send a
19:35
message to your dad and your dad is on vacation um and you know he's going to come back after six months so despite
19:42
the server getting the message it's possible that he never gets the message right that is that is always possible
19:48
yeah let's that's a good point actually because it brings us into flow the the flow of how the message reaches we know
19:54
how messages reach now if you want to see that the person has actually read the message how do we get that first
20:00
thing would be you send a message to the chat server when the chat server gives an acknowledgement we know that a single
20:05
tick comes on WhatsApp so's got the message most likely uh your your friend is now going to be able to see it yep
20:11
the the second that um chat server 3 forwards the message to mobile B that's
20:19
when and B gives acknowledgement okay I got the message that's when the reaches
20:24
chat server 3 chat server 3 says okay where did I get the message from who's The Source where is the source it finds
20:32
that chat server 2 is the source again it goes to the connection Handler it can't do this by itself it if the client
20:38
cashes it it's okay but otherwise it goes to the connection Handler gets that a is connected to chat server to chat
20:45
server 2 sends a message to mobile a and says uh you know the destination device
20:50
got the message correct and finally finally when the opens the app yeah sorry the duplex connection really helps
20:57
over here right because we are able quickly communicate yeah I I see that b
21:02
migrated very quickly now when B actually reads the message one of the things we can do is we can have B
21:08
reading the message here again it goes to chat server 3 saying that I have read the message it finds where a is
21:13
connected chat server 2 it then sends a read receipt and on your mobile you'll
21:18
be able to see a blue tip the two tips will become blue so that's great a few things have to happen with disappearing
21:25
messages but let's just start with the the point that you have KY that what if a person is offline how long do you
21:31
store these messages so one thing we can do is we can give them a uh time to live
21:37
these messages can be there at most 7 days because they seem like you want them to disappear uh so in 7 days if the
21:45
person has not read it it's not going to stay on the server despite it being encrypted we will delete it that's one
21:50
possibility right um yeah I think or or you know if we have overflow of system
21:56
or something that we'll delete the message that that's also possible so when where do we store the message for S
22:02
days or for whatever so we can store it in in the chat server itself in memory
22:08
uh it will go like in a q data structur in the chat server for this user so they
22:13
they go one by one what if the chat goes down yeah we lose the message that's oh
22:20
so we are okay with that yeah um suppose we were not okay with it like we should
22:26
not lose the message for 7 days okay so we would need some sort of a database which would store that message and then
22:34
we could you know retri uh some sequence number would also need to be there making sure that those messages are
22:40
received in order on these mobile maybe a time stamp local time stample book I think we can get to the disappearing
22:47
messages part now yeah so interesting part when B has read the message normally in WhatsApp you get that double
22:54
take here if B has read the message and you're looking to delete the message
22:59
from device so where does that start so one of the things is it has to be
23:05
deleted on both devices not only B but a also correct correct so let's say B
23:11
starts with the deletion so they they watch an image or they they read a message as long as the mobile is open as
23:17
long as that tab is open I don't think the message will get deleted the moment I close the tab there has to be some
23:22
client code which is going to delete the message from their device so we have to
23:27
rely on client here yeah so once the message is deleted in parallel it can
23:33
send an acknowledgement that I have read the message right so the moment you get acknowledgement whenever that double
23:38
Blue Line uh was going to be there chat server 3 gets this red receipt deletes
23:44
the message from its local memory sends acknowledgement to chat server 2 saying please delete it from your local memory
23:50
also chat server 2 also deletes it and now goes and tells mobile a listen the message reached it has been read I'm now
23:57
going to delete it so mobile a then goes and deletes this message when you move out of that tab so it might have a set
24:03
of messages that it's supposed to delete when you switch tabs this would be a flow of the message delion I think yeah
24:09
this is how they there are a few repercussions what if a is offline like when this car is the message so if a is
24:17
offline and we keep trying to delete the message we keep trying for a while but again we have no guarantees uh that so
24:25
there should also be some mechanism that after sending like suppose even if it doesn't get delivered after sending also
24:32
after a while say 7even days we are like discarding the message right then in that case we should delete from a as
24:38
well suppose we did not get the delete message or B did not get the message in
24:44
any case we should be relating it from a as well so that will also be taken care of the on the client side probably that
24:50
okay it has been 7even days this all sent and this has not been deleted so it's time that we delete the message
24:55
possibly yeah possibly or maybe you keep keep it forever uh is also possible let's take
25:02
an example we send a disappearing message to a party to to a destination
25:07
the destination doesn't see the message for weeks in fact years they're not interested in that message so now mobile
25:15
a can keep it hanging around for that message for other which yeah might be okay these are the kind of decisions we
25:21
would have to make because we are not letting B never read the message right we deleting it after a week yeah uh in
25:28
fact in fact we are we are deleting it from our server but we might know that B has gotten the message it reached their
25:34
mobile we got the acknowledgement but they're not reading they're not they're never reading this message so Al the
25:40
mobile has given the acknowledgement um and this is I guess a pretty common scenario right yeah we don't open the
25:46
message and it is there yeah yeah it's just there forever uh so read receipt is never going to happen in which case chat
25:53
server 2 never tells a to delete the message that's fine so in a sense the
25:59
read receipt is now replaced by the action that delete the message in very
26:04
simple terms that actually sums up the whole design yeah yeah I think it will
26:11
be far more complex in a group message or especially like when we have to
26:16
consider the delete after some time so should we start talking about that as well yeah I think group message do you
26:23
want to give it a short K what do you think will happen if there are like there are multiple uh people here I'll
26:29
just I'll just draw them so the complexity over here is that to be delete for only that person when like
26:37
message comes or do we delete from the group together when all the people have read it so how does it work because it
26:46
would be very weird some people can see it some people cannot see it right so
26:51
even if one person doesn't read the message at all then it is always there that means everyone has not read it
26:58
not everyone has read that's correct yep so the moment everyone reads it we are going to delete it right yeah so now the
27:06
thing is that now we cannot handle it on the client side that the person has read it so we are going to delete it now this
27:12
has to be done on the server side that out of these suppose 100 people in the group I know 100 is a big group but
27:19
suppose 100 people in the group how many have read it and how many have not like
27:24
is there anyone who has not read it so it is sort of like a visited set how many of them have visited this
27:30
particular message and the moment everyone has visited we supposed to delete the message now this has to be
27:36
kept on server for every single message which is actually a lot of data to keep so should we like if we do that should
27:43
we talk about how would we store this data for every single message in a group
27:48
that we could also keep a counter that how many people have actually but then again it becomes complex in the sense ke
27:56
if someone leaves the group suppose I sent the message there were 10 people so
28:01
we were waiting the count should become 10 but now someone leaves the group so
28:07
now actually the count should have been 10 or nine we do not know it should have been 10 but someone gets added yes yes
28:15
in both that's also possible that yeah yeah so the person who read it has left
28:20
while a new person came in and they haven't seen it so I think what we can do then let's start with the basics how
28:27
would we send the group message let's not go for disappearing right now how would we send a group message in this so
28:33
we have multiple servers multiple people connected to each server um if a is sending a group message what are some of
28:40
the optimizations we could make because if 100 people are there uh it's going to broadcast to 100 people so how would we
28:47
I don't think it should be the chat server to who should be messaging to the chats over one and three like directly
28:54
that's why initially I was saying probably having something like Kafka or a middle wear does make sense
29:02
because even if they are offline you're basically putting it to the kafa and they can pick up the topic as and when
29:09
like suppose B comes online or D comes online and that would be very helpful for group messages as with let's say you
29:15
send a group message of high and it reaches chat server two that's where you
29:20
are connected now BC and D want to get this message The Brute Force way I guess
29:26
would be find out where DC and D live through the client device one by one is
29:31
there an optimization we can make here like one by one would be three so order and
29:36
Al lot of algorithms I'm using here but how can we speed this up is there any
29:41
other is there an optimization here I probably just you know as I was saying
29:46
like probably have another server who's responsible for the group messages to send the group messages okay okay so we
29:54
send a message with a group me group ID saying that you know I'm part of this
29:59
group I'm sending a message to this group also it is not like chat server two knows that who all are there in the
30:04
group there would be basically a group TP would which would have all the information right that who all are
30:11
connected like yeah who all are part of this group basically right sense yeah so
30:17
it does make sense to have like a separate DB that is going to take care of it like separate server who is going
30:23
to take care of it for us okay okay let's assume that we have this thing working for us and the group service has
30:30
a clear mapping of who is connected to which group G is connected to Mumbai
30:35
group is connected to system designers group and so on all the WhatsApp groups that is part of would you like to
30:41
quickly discuss that how are we storing the group database that in this group who all are there so the usual query
30:48
that is going to come is that in this group who all are there right not that this person is in which all groups like
30:54
The more common query is basically in this group who all are there yeah so how do you want to store it which DP when I
31:00
open my cell phone I want to know which all groups I am a part of uh so that is
31:06
one type of query the other type of query like you mentioned is who are part of this group so both are reasonably
31:11
common U what I would store is a table of relations kov is part of this group
31:18
and so if kti is also part of the same group then it will be kti is part of group ID one cor is part of group ID one
31:25
and corov is part of some other group also so group id2 uh so you have two way n is to n relation where G is part of
31:32
many groups and a group has many members I would personally not agree with a SQL
31:37
DB over here firstly because vertical scaling is going to be hard and then you have to keep checking the relations
31:43
versus something like a mongod DP which has that in this group these are the user IDs would make more sense for me
31:50
because the quering would become a lot more efficient also the to the point that you like you can comment on it
31:57
obviously there's no right and wrong I'm just giving the reasoning because there going to be so many users right and any
32:03
user could be connected to anything because horizontal scating is hard when it comes to SQL DP and also to the point
32:10
that I am connected to virual groups we could obviously on the client side also there can be like a small DP like SQ
32:17
light right which has information that I am part of which all groups what do you think I think yeah I would probably cash
32:24
this stuff again uh like you had the idea of you know client having least recently used stuff the group service
32:32
can also have when a group is talking they're talking and when they're not talking no nobody's there so maybe I can
32:39
cach that information locally and then respond to queries so if a add to a
32:44
group if you're saying SQL DB I have some questions that how would you handle this because suppose we have like a huge
32:51
database right like Suppose there are 1 billion users WhatsApp has 2 billion users right let's say 1 billion users
32:58
and obviously they're going to be across different different DB servers now in one group there are some that are
33:04
connected to One DB server one connected to another DB server another connected to another DB server then you would have
33:10
to essentially get info from different different DB servers and where would you C like you would be caching on One DB
33:15
server right then you would have to join it together in the group servers is that what you are talking no I'm not talking
33:20
I I actually didn't mention SQL but if we are doing it in SQL yeah sure that is one way no SQL also we'll have to do the
33:26
same thing you will have to eventually scale horizontally if you have billions of groups so let's say there are
33:32
billions of groups different people are part of different groups let's forget caching for now we are not going for a
33:38
graph database because in groups I don't think we can do it but I'm not going for a graph database let's go for a simple
33:46
SQL database in that case yeah we would have to have multiple servers managing
33:52
group data so I'll just draw that out by the way I'm sorry I thought you said relational data like Rel
33:58
that's why I thought that you resuming SQL DB okay okay no yeah the way I was
34:04
storing it is as relations maybe SQL DB will be really good for that kind of query so let's say we have three of
34:10
these and we store data randomly here we don't store it you know partitioned according to user or anything we store
34:16
it partitioned according to group ID which can be so okay now if we have this uh and I want to find all the members of
34:24
a group it becomes easy I have to just hit one partition interesting yeah but if I want all the groups that gorov is a
34:31
part of then I have to hit all partitions okay that would be I mean if I'm assuming that the first type of
34:36
query is more common that who are the members of this group then I will partition according to group ID if I see
34:42
that this person is part of which groups then I'll partition according to user ID I guess you and I are both assuming that we are assuming that it is going to be
34:48
partitioned by group ID because usually you want to find all the members of a particular group K I have two more
34:53
possible solutions and then you tell me which one do you prefer one more is that what if Cassandra which is a column in
35:00
DP and why am I saying that is because there the data is stored column wise right so suppose my table looks like
35:06
something like this so this user connected to this group so our actual query is along a column which will be
35:12
very efficient for colum DB like Cassandra that could be one reasoning that I could be okay with another thing
35:19
because it is going to be a read heavy operation as well and we might need flexible schema because we do not know
35:27
that in a group tomorrow what all things we need to store like today maybe there's something something something and tomorrow we need to store something
35:33
extra that is one reason also if I store in mongod TP it could also be like that group ID and then there's basically an
35:39
array of user IDs that are connected to that that is very simple I basically don't have to do any joins and get it
35:45
from different different basically you know servers and put it all together so obviously there's no right or wrong but
35:51
out of these possible solutions that we have discussed so far what makes most sense to you see if you are going to
35:58
horizontally if you need to scale horizontally right billions of flows can be stored in a in a single note without
36:04
any problem not at all hard but if you need to scale horizontally let's say if this is a necessity then whether it's no
36:10
SQL or SQL this has to happen at some point in time you will have to move some groups into one node some groups into
36:18
another yeah so in that case whether you use mongod DV or whether use uh
36:23
Cassandra or anything you will need to scale this way but considering the query which DB would you go ahead with because
36:29
there are aggregations involved here I would probably go for a DB which gives this off the shell so a no SQL database
36:36
like Cassandra if I'm if I'm running all this on AWS then I would just use Dynamo DB okay yeah cool cool yeah I think we
36:43
have discussed enough pros and cons I think yeah we have this group service but I think it's it's pretty important
36:49
also that we discussed it because without it it's not clear so we have for a particular person a sending to group G
36:57
all part of the same group G this client goes and firstly uh the chat server is
37:05
going to say get members the group service is going to respond to it by finding out that okay Group G belongs to
37:11
this DB let me get all the group members give that as a response now chat server 2 has only one option which is to talk
37:19
to its client and say get me all the chat servers which these group members belong to that that is the only thing
37:26
that can happen let let's add another user let so user e is here they light
37:31
green so is this
37:38
mhm so you're saying after getting the members it is the chat server to itself that is sending to all the group members
37:45
yeah so it's going to go and talk to the connection Handler saying that tell me where the each of those group members
37:50
are connected yeah so we how would you optimize this K any any idea on you know
37:57
I need four members so that would be four API calls any Improvement that we
38:03
can make here do you want at server to to2 so much can we delegate it to another server we could but I mean
38:10
somebody has to send the messages somebody has to find out where these connections are so maybe we can use a
38:16
our API currently just takes one user and gives back one response is there a better way yeah obviously like we can
38:22
have for multiple also like we could have another API for multiple and in the payload we could send like AR of
38:27
basically user IDs that you know give us the where these are connected and in the response also in the payload we will get
38:34
for like this is connected this this is connected to this so that would obviously be more efficient instead of four calls we're making one call right
38:41
right so makes total sense uh B is connected to three C is connected to two
38:46
D is connected to three again and E is connected to one so this would be a single response instead of giving one by
38:52
one so we have a connection Handler gives us all of this stuff now it's a group mage message so we send
38:58
the group message to chat server one and chat server three and we give them a they themselves expose an API where we
39:04
tell them that look three you send it to B and D I am going to send it to uh C this is chat Ser two and one please send
39:11
it to e and so all these chat servers they broadcast the message in the end yep so that's a group okay now all we
39:18
have to do we are able to send group messages we are able to send disappearing single messages all you have to do is make that group message
39:24
disappear so and the problem is that different people are connected to
39:29
different chat servers so they have their uh we need a way to tell that everybody across the different chat
39:35
servers have actually read the message yeah that is a bit challenging actually
39:40
I think we would need another DP for that yeah yeah we we can't have it like
39:46
it would be mad for all the chat servers to coordinate between each other and say I I got something I think we need to
39:51
centralize it and we can see that the centralization is Z yeah like per message the info has has to be that it
39:58
has been you know read by how many of them yeah how would you store that g now just to simplify things I would probably
40:05
say that you know this message ID uh has been read by which parties that is the
40:11
mapping we need so the moment all group members are covered in that message ID
40:18
then we delete from all the group members so let's take a simple example God of sends a high the high reaches
40:24
everybody mhm when the he opens their mobile and they see it so chat 3 gets an
40:31
acknowledgement not acknowledgement they get a read re so G of sent a high D has read it chat 3 got the read receipt they
40:40
need to store this somewhere they need to say that D has read this message of do K I have an interesting sort of out
40:47
of context question okay so when the are initial flow right that when one message
40:53
goes to another message where is message ID generated who is doing that because in this we would have to store that this
40:59
message ID because we are not storing the message right so this message ID has been basically read by these many people
41:06
in the group but now the thing is that our different different chat servers are taking care of it so there are who is
41:12
donating this message ID now yeah so I think the message ID can either be generated by the client they can send a
41:20
uu ID uh they can also send because you want these ordered according to timestamp ideally the client can just
41:27
generate the message ID as for this group this user like you append that information and say at this than stamp I
41:33
sent the message so that's also unique ID yeah who is sending it two basically
41:39
two can be either one to one or it can be a group so who is sending two and basically the typ stamp right so three
41:45
things will together make the ID just making it clear because these sort of questions do just do come right like
41:51
people do not understand it who is Ting it okay and then this message ID or this U ID is going to be at are basically
41:57
referenced that okay it has been read by these many user IDs right okay the
42:02
reason client is generating it is because if the client wants to retry sending the message at least it can use the same ID so for example your internet
42:10
connection is sped you went through a tunnel you sent it once you come out you didn't get the acknowledgement you send it again so it won't be a I mean the
42:17
redrive will be imported uh they will it will be executed only once and actually
42:23
every time a user reads the message like for example B at the message in the group right so in that time we can check
42:30
in the DB that okay now we are marking this as red does that mean that everyone has red okay at any point when we see
42:36
that everyone has read at that time we can send the message to everyone that yeah you need to delete it yeah yeah the
42:42
same logic that we had for like one to one messaging we are just trying to replicate it using this Central uh store
42:49
of group service so this message was read and now everybody needs to delete
42:54
it so the problem here is that these messages will tend to hang around for a long time so that will be like a lot of
43:00
hanging around messages and also for every message ID there's potentially 100
43:05
or 200 people who you have to tag like this person saw it this person saw it so
43:11
and we have to keep checking also did everyone read it or not and instead of like okay just making it a bit more
43:17
obviously it is very uh lowlevel details but you know instead of saying it this message ID one has user one Reddit has
43:24
user two Reddit has user three Reddit keep like only those users have who have not read it and keep removing users as
43:31
they re read them and then in the end if there is no one left then you're supposed to like check from the group
43:37
service that who all are part of that group and then send message to that and every time we could also handle people
43:44
leaving and entering a group like this that someone leaves you remove from that
43:49
basically set of user IDs and someone enters you add to that set all the sets
43:56
of M me that are there for that group whichever ones active yeah I think that's a great idea whichever messages
44:02
are active in memory if you have not seen it we will wait for you to see it I
44:08
don't know if this is the best data structure but this will work if you have a map of this ID has been read by which
44:16
users or has not been read by which users it will work because as you get the read receipts you will keep removing
44:23
them from that message set only problem is for every message message you going to be storing the entire set of users
44:30
IDs so let's get a uh capacity estimation question here I think we have
44:36
how many messages will be sent per day in a group uh and we have to just message ID versus user ID so let's say
44:44
200 people so 200 user IDs would be let's say each uh user ID is 64 bits
44:51
long so that is uh how many long did you say eight bytes 64 yeah okay so eight
44:57
bites and then we have let's say in a day these guys are generating thousand
45:02
messages it's a I I don't know if you have seen this uh the way that taxis you
45:08
know they are part of hundreds of groups uh with thousands of users in cases
45:14
because they are looking for like business so people keep posting hey I'm I'm in picher I'm 200 kilm away so it's
45:22
possible such groups are also possible really hot groups um and they send a lot of attachments also so the CDN is also
45:29
getting a lot of load from these guys so will be how many bites roughly I
45:37
think I don't think we need to store the message uh we just need to store the ID of the message so each ID will be let's
45:44
say 16 bytes let's say 120 bits or 32 bytes
45:51
256 okay okay okay now we have 32 KB plus it's a it's not
45:57
that's nothing exactly yeah but this is one group so 32 KB plus 200 into 8 1600
46:05
so okay I can even ignore that yeah yeah yeah so 32 k for one group uh like this
46:13
what Max like we can say 1 billion groups right makes sense yeah that would be in terabytes yeah that would be too
46:19
much but 1 million 1 million is more reasonable okay all right 1 million groups right so into I think there are
46:27
32 GB here 32 GB yeah you get these computers a single single one should be
46:32
able to handle all read receipts yep even even if it can't right we can horizontally scale this it's not a
46:38
problem this is shed by group ID so yep yeah makes sense doable cool okay
46:47
would you like to quickly recap because I think we are almost done with one hour yeah uh so what we did is initially we
46:53
looked at how to send a message from one place to another uh we iCal component of this is the connection Handler which
46:59
helps route messages from one place basically stores the information of who is connected where so in that way we can
47:05
route a message from any chat server to another and the final destination we spoke about how acknowledgements whether
47:12
it is delivery or read receipts are made and in our case because disappearing
47:18
messages uh read receipt is equivalent to deletion on client devices hard part
47:24
was group messaging uh we talked about how the group message or the groups can be stored in
47:29
databases who is part of which groups we're sharting by group ID because that's the more common type of query uh
47:36
a group contains which members and once we get all read receipts from all
47:42
members for a message uh from their clients we then go update the group
47:47
service like all the messages all the read receipts will basically remove all users from this message ID key value
47:54
pair and then we uh can send a broadcast delete message to all group members so
47:59
that part I think wasn't very clear we can send a broadcast delete message to all chat servers saying that please
48:05
delete this message ID or at least we can send a uh Delete we can broadcast to the set of nodes these chat servers
48:12
which are belonging to that group that can also that is known by the group service yeah and how does the broadcast
48:17
happen if someone has like final query uh you can go to the connection Handler again can go here and have a client here
48:24
also so when you are asking for missions the client manages
48:30
that great this looks good I think yeah yes nice and
48:36
colorful awesome we hope you all had fun and please do let us know in the comments any feedback you have anything
48:42
else you would like us to cover uh we would love to like you know have you all also on board for the more discussions
48:49
and if you have any questions we would love to see your approach as well if you have any poters about how we could have
48:54
improved this design let us know we would love to discuss in the comments okay and see you guys take care bye-bye
49:01
see you next time bye
