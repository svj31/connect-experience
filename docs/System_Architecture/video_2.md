Intro
0:00
all right hello everyone welcome back to the channel I am back with another breakdown of a common system design
0:07
interview question this time Love Is in the Air uh we're going to be designing
0:12
Tinder um so if you like our content you want more of it make sure you like subscribe you know all those things that
0:18
I have to say uh but really the increasing number of subscribers is motivating to us and it's motivating us
0:24
to keep pumping out more and more content for all of you so if you're enjoying it go ahead and take a moment
0:29
to do that uh quickly for those who are new to the channel I'm Evan I'm a former meta staff
0:34
engineer and interviewer conducted many hundreds of interviews uh and nowadays I'm the co-founder of hello interview
0:41
and hello interview is a site that helps software Engineers prepare for their upcoming interviews both via free
0:46
educational resources uh as well as paid mock interviews with senior interviewers from your target
0:52
company um if videos aren't your thing I'm going to link in the description a written guide um that has all of the
1:00
same that covers all of the same topics that I'm going to discuss in this video so let me show you what that looks like that's over here you can see on hello
1:07
interview.com we have a lot of common problems at this point Tinder being one of them this was actually written by one
1:14
of our top coaches Joe Joe was a former staff engineer at meta he's currently uh
1:19
an engineer at notion Joe and I actually went to college together uh he's a super super bright guy so this is a fantastic
1:26
write up he also wrote the Cassandra write up here as well as YouTube so give this content a a a read um I'm going to
1:34
put his LinkedIn as well as my LinkedIn in the description so if you want to connect with either of us you can find those there last thing um before we get
1:43
started we've been working really hard this last couple months on what we call guided practice and so if you want to
1:48
practice this problem or really any of those problems that we have here on the leftand side um you can use guided
1:54
practice and this walks you through each of the steps in our delivery framework the requirements the Coreen the apis uh
2:01
deep Dives highle design and gives you instant feedback on each of the
2:06
questions so this was a deep dive question I just answered we'll talk about this in the video I nailed it um
2:12
but you can see kind of all of the questions here going all the way back to when you did API routes that wasn't a very good answer core entities the
2:18
non-functional requirements Etc so take a look at this uh you can do Ticket Master for free right now um the other
2:25
ones do cost money they're 60% off through the end of September it's just a thank you that any early users so give
2:31
that a look but enough of the upsells let's Jump Right In I know what you're here for let's show you how to design
The Approach
2:40
Tinder all right so what the heck is Tinder in the first place well Tinder is a mobile dating app uh it was
2:46
revolutionary when it came out the way that it works is it shows you a stack of profiles that match your preferences and
2:53
are close to you in location and then you can swipe left or right really quickly in order to indicate swiping
3:01
right if you like someone and left if you don't like them or if you're passing on their profile and then if two users
3:07
end up swiping right on each other then they match and you're allowed to dm with each other and chat so that's what
3:15
Tinder as an app is now as we walk through this call it a system design
3:21
interview of course this isn't uh a exact replica of a system design interview because it's me an interviewer
3:28
walking you through kind of in more detail than you would provide in an actual interview how I would answer some
3:33
of these questions and how I've seen candidates answer them in the many times I've asked uh candidates to design
3:39
Tinder but we're going to follow the hello interview recommended delivery framework and if you've watched any of
3:45
our other videos then you know this framework really well by now but I'll go over it just briefly the first thing
3:51
that we're going to do is that we're going to lay out the requirements of the system this is both the functional requirements or the features of the
3:57
system as well as the non functional requirements or the qualities of the system qualities are those things like
4:05
the latency the scalability ETC you'll see when we get there we're going to define the core entities of the system
4:12
these are basically like the tables that you're going to have in your data model the entities uh we won't go into the
4:17
fields just yet that'll happen later on in the high level design but we'll get a a basic overview of what entities are
4:24
exchanged uh and persisted in our system and then we'll move on to the API design
4:29
so we'll document the apis the user facing apis of our system basically the contract between our users and our
4:36
backend data flow is not relevant to this problem that's only relevant for non user-facing system design questions
4:43
for which this is user-facing nonuser facing are are things like you know designed distributed uh job scheduler or
4:50
rate limiter or a message CU you know some of those deeper backend components so not relevant here you can check out
4:56
the videos on adclick aggregate or WebCrawler if you want to see examp examp of data flow uh then we're going
5:01
to sketch out a simple highle design of the system now crucially the goal of our highle design is to just satisfy our
5:08
core functional requirements we're not worried about the non-functional requirements yet we're not worried about scalability or uh ensuring our
5:14
availability consistency guarantees or any of that stuff yet we're just getting down something simple that's going to
5:20
work and satisfy our functional requirements and then we get to the fun part which is the Deep Dives this is
5:26
where we take that simple highle design and we layer on all of the nonfunctional
5:32
requirements by going one by one through them and going deep to ensure that we can satisfy each of them so this is the
5:40
the general framework that we're going to follow let's get
Requirements
5:46
started as promised we're going to go ahead and start with those functional requirements and so so you guys don't
5:52
have to watch me type I'm actually going to paste in the functional requirements here and we'll go through them and so
5:58
when the interview first starts this is a time where you can ask some questions like you may not be fully familiar with how Tinder works that's fine spend some
6:06
time asking your interviewer not only how Tinder works but which parts of Tinder are most interesting to them and
6:13
so this is where you might list out some of the features like you can see on the screen here and then prioritize them say
6:19
like these are the ones that I think matter in this 35 to 45 minute interview and here are some of the ones that I think fall below the line so in this
6:27
case and when I ask this question this is is the set of functional requirements that I usually land on with the candidates and that's that first users
6:34
can set their preferences and so this is like the type of people they want to match with so the age range the gender
6:40
that they're interested in things of this nature any preferences uh maybe and
6:45
then importantly this doesn't include like creating a profile I usually put
6:50
that as out of scope and so we can do that here actually so out of scope o like creating a full profile we will
6:58
create a profile only because it's important to set the preferences but in terms of like linking all of your images
7:05
as a user and you know your description and your funny witty prompts and all of that we're going to consider that out of
7:11
scope now once a user has set their preferences then we're going to need to be able to or they're going to need to
7:17
be able to view that stack of potential matches and so the user can view a stack of potential matches and this is going
7:24
to be based on those preferences that they set so we should only show them people that are in their age range and gender preference Etc and importantly
7:32
they need to be close to their current location so this needs to be users who are only you know n miles and one of
7:38
their preferences set can be the distance that they're okay with um and so it'll be n miles from their current
7:45
location is the only matches that we'll show them and then from there users can swipe left or right no or yes
7:51
respectively on each profile and if two users swipe right then they should get a match notification that they've matched
7:58
so those are the core functional requirements that we're going to go with now I'll often times when asking this
8:05
question introduce a constraint which makes this problem more interesting as well and that constraint is that we want
8:11
to avoid showing repeat profiles so if somebody's already seen a profile then
8:16
we don't want to show it to them again this makes sense and this is how Tinder Works you've already decided if you like or don't like someone there's no reason
8:23
for us to show them to you again so that's our functional requirements of
8:29
course uh functional requirements these are the core features of the system they're usually phrased in this like users can
8:36
users should be able to users whatever that's that's the framing of these functional requirements and that's how
8:41
you should be thinking about them in your head now when it comes to the nonfunctional requirements let's write
8:48
that out here non-functional requirements this is where you worry about the qualities of the system and so
8:55
this is where you're going to consider things like cap theorem this is where you're going to consider the scalability
9:00
the latency the fault tolerance the durability all of those ility statements that you've heard and know so well
9:07
there's actually a list of these things that should be considered on the Hello interview website if you go to the delivery framework and then go down to
9:12
non-functional requirements uh I've kind of documented the list of things that you might want to consider here um and
9:19
so the key is that like all systems are usually all these things all systems try to be fault tolerant and scalable and
9:26
low latency and of course they do but with non functional requirements you're specifically trying to identify the
9:33
qualities that are uniquely challenging and interesting for this particular system that's the goal and so step one
9:40
identify which of these qualities are relevant to this system step two put them in the context of this system and
9:46
then step three if possible quantify them so let's do that together here the
9:52
first thing I would consider is Cap theorem so should this system prioritize consistency or availability and you
9:59
don't know about cap theorem go give it a read it basically states that in distributed systems you have to choose two of three consistency availability
10:06
and partition tolerance partition tolerance is a guarantee in a distributed system so we decide between
10:11
prioritizing consistency or availability in making this Choice the question is really does every single read of the
10:18
system need to read the latest right or else it will fail if so we need strong
10:25
consistency if not then we'll probably prioritize High availability and so in the case of this system we actually want
10:32
to prioritize consistency specifically in the context of the system swipes so
10:38
we want consistency for swipes and the reason for this is because the way Tinder works is that when the second
10:44
person swipes right on a profile for whom that other person already liked them then they instantly get a uh you
10:52
know match notification that shows up on their screen notification might not be the right word but the second they swipe
10:59
then bang it goes you match and it gives them a little celebration thing um and so in order for us to ensure that we get
11:05
that match right when we swipe right well we need to have the most accurate
11:11
view uh of the latest rights when we read to know that somebody else had already swiped on us even if it happened
11:17
only moments before and so I'll talk later on in the Deep dive some caveats here uh there is a way to satisfy this
11:24
problem without consistency for swipes but um I'll go into more detail on that later for now we're going to prioritize
11:30
consistency over availability specifically as it pertains to swipes for all other parts of our system we'll prioritize High
11:37
availability um other things that we want to consider here is when a user opens up their app they want to get
11:43
their stack of potential matches shown to them immediately so they don't want to have to be waiting and this is a long
11:49
operation potentially um as it pertains to to Tinder because we're having to
11:54
filter all of the profiles based on location which can be expensive and then based on on your set of preferences and
12:01
without careful consideration here during our design this could take a while and so I'm going to explicitly
12:06
call it out as a non-functional requirement I want low latency feed SL
12:11
maybe we'll we'll stick to that same terminology stack loading and I'm going to quantify it I want it to be under 300
12:17
milliseconds and so for quantification here what you should think about is 200 milliseconds is perceived by humans as
12:24
real time this is like a blink 200 milliseconds and so when we have results
12:29
and things we usually want to be between that 200 and 500 millisecond range and so I'm just putting 300 here 500 maybe
12:36
would be okay to half a second um but I'm going to go with 300 and then the next thing to call out
12:42
here is that there's going to be a lot of of Rights particularly from swipes
12:48
like swipes are so easy and because they're so easy users can just swipe left right left right left right A ton
12:55
and so maybe in the interviewer in the interview I would ask my interviewer what's the scale of this system or I would make a prediction and I'll tell
13:01
you it's about 10 million daily active users and so we can write you know maybe
13:06
somewhere around here let me move things around to the scale is 10 million daily
13:12
active users and so um if we have 10 million daily active users and each of
13:18
them swipe on say 100 profiles or whatever each day then this is a lot of Rights and so what I'm going to add to
13:25
my non-functional requirements is scale to handle the high right through
13:31
throughput of 10 million time 100 swipes a day and of course they'll be Peaks
13:37
associated with that too so those are my non-functional requirements and now of course we're going to use these when we
13:42
get later in our deep Dives um to inform what we need to satisfy in our system
13:48
where we should go deep and what we need to satisfy so let me stop here and let's move on to the core entities in the
Entities & API
13:56
API with the requirements in place we're going to move on to the core entities
14:01
and then the API and so core entities this is where we simply
14:07
document uh kind of the core entities that are persisted and exchanged in our system we don't need to do the full data
14:14
model the full schema here but I would communicate that with my interviewer so I would say explicitly like I'm going to
14:20
document the core entities these are going to be the tables that I'm going to have in my database uh I'm not going to
14:25
go into the full schema or data model yet because it's a little early in the design I don't know all of the columns
14:31
just yet so instead I'm going to do that when I get to the highle design and so for here I'm just going to call out what
14:37
are these main entities well we're going to have a profile this profile is going to be responsible for storing the
14:42
preferences of the users uh we're also going to have a swipe when user swipes
14:48
left or right we'll persist that and then we're also going to have a match if two people match then we'll create a new
14:54
match entity to to identify that this was a match so these are the core entities of my system easy
15:02
enough we're going to go from there onto the API and so these are just the user-facing apis needed to satisfy our
15:10
functional requirements and so the way to build up your apis is to look at your functional requirements and go one by
15:16
one through them often times there's a one toone mapping between a functional requirement and an API this isn't always
15:23
the case we'll actually see an example of that here and sometimes there's maybe two apis required to satis by a single
15:29
functional requirement but this is the the general uh process that you should
15:35
follow to come up with these apis so let's do that here the first one users can set their preferences so this is
15:40
essentially creating a profile with their preferences of course we talked about how out of scope is creating a
15:46
profile with their images and all of those things but we do need to create a profile that at least just has those
15:51
preferences because that'll be important to creating the recommendation stack and so we're going to use rest here we're
15:57
going to make sure that we have proper rest vers so I'm going to post my resource is going to be profiles and the body of this request is
16:05
going to be those preferences so maybe the Min age maybe the max the max age
16:11
the gender that I'm interested in matching with the radius how far away they can be from me and maybe there's
16:17
some other things here uh in terms of preferences as well and this could either just return a success 200 or
16:23
error otherwise or maybe it Returns the actual profile back to the user either way now the next one that we need to do
16:30
is that users can view that stack of potential matches this is going to be based on those preferences that we just said as well as their current
16:37
location and so this is going to be a git request and this is going to be on the resource stack or you know some
16:42
people are very particular about the plural of their resources so we can call it Stacks I don't have a strong
16:48
preference there um now the server is going to take into consideration those preferences that we stored in our
16:55
database in the profile entity um but it also needs to know the user's current location and this isn't something that
17:01
we're going to store cuz it's something that's going to change so we're going to require the user to pass this into us
17:07
via the API specifically via a query pram here so they're going to let us know where they are the latitude and
17:13
longitude uh and then this is going to return a list of profiles and so this is one of the nicest things about following
17:20
this framework of doing core entities and then API because our API can just reference these core entities we don't
17:26
need to document all the fields and columns and and you know I did do the post body here didn't necessarily even
17:32
need to but this is going to streamline our API writing I don't need to again write everything that's in a profile
17:37
it's just a profile I'm referencing that core entity that I defined now we also
17:42
need to know what user we're getting a stack for of course and so some people might think to put the user ID up here
17:49
as either a path parameter or a query pram maybe even put it in the body as uncommon that is in get requests um but
17:55
these would all be security concerns you know this if you've watched some of the other videos we don't want to put put the user ID into the request itself at
18:01
least not into the the body or the query or path progams because it can be easily manipulated uh so I could just make a
18:07
request with somebody else's ID and I could get their stack and see their preferences um that wouldn't be very
18:13
good or their matches based on their preferences that wouldn't be good so instead uh we're going to use proper API
18:19
security here and we're going to use either JWT or a session token in the header and this is what we're going to
18:25
use then server side to validate who the user is making this request okay now the
18:31
next one that we have here is that users can swipe left no or right yes and so this is again going to be a post request
18:37
because it's going to create a new row in our database in our swipes table create a new swipes entity and so we'll
18:43
have swipes here we'll need to know who we're swiping on uh notably this isn't you this is the other user that you're
18:50
swiping on um so as a path parameter here we're going to have that user ID
18:55
because it's required that's why we use it here um and then the post body will
19:01
be something like maybe the decision of either yes or no this could also be left
19:06
or right or anything like that so we have these three core apis and then then
19:11
this again could just return uh you know I guess it's going to return did they match yes or no so it might return a
19:18
match object um but that'll be optional it could also return just undefined in the
19:24
200 so looking at our last functional requirement here two users swipe right they get a match uh and there's a
19:30
notification and so in this cases we'll talk about more later on and we already alluded to it the second person to swipe
19:37
is going to get that instant match that shows up on their screen right for the swipe the other one's going to need to get a push notification and so that push
19:43
notification part well that's not an an a user facing API our server is going to
19:49
in uh initiate that so we're not going to write an API for it uh instead these
19:55
are our Three core user facing API and now as we move on to the highle
20:00
design we're going to use these to go one by one and ensure that our design is
20:06
able to satisfy each of these requests both the inputs and outputs of these
High Level Design
20:13
requests okay so we' got the requirements in place we've outlined our core entities we've also documented our
20:19
API at this point we're sort of like done with the setup we have a really clear understanding now of the problem
20:25
what what it takes to solve it what our contract is is with our back end and now it's time to start sketching that out so
20:32
we're going to head to the Whiteboard and we're going to draw out our highle design and our our highle design again
20:37
the goal is to meet these functional requirements and we're going to just start simple and so what we're going to
20:43
do is we're going to go one by one through these requirements or put another way one by one through our apis
20:48
and we're just going to make sure that our system can handle each of these so let's start with that users can set
20:54
their preferences so we have this post API on profile this is going to need to store some profile information for the
21:02
user so how can we do that well I'm going to introduce here first a client
21:07
this is just going to be the user's mobile device since this is only mobile applications this is going to interact
21:13
with I'm going to put an API Gateway in here potentially early uh you could hold off and do this later but I'm going to
21:19
opt for microservice architecture it's by far the most common architecture in the system design interview so if you're
21:25
not sure it's probably the right thing to go with but when you introduce a microservice architecture then you want
21:30
an API Gateway here and the main thing that it's going to handle is routing so it's going to Route each of the API requests to the appropriate service it
21:37
can also do some additional middleware like authentication or uh
21:42
authorization things like rate limiting potentially whatever slightly less important I wouldn't spend a lot of time
21:49
there in the interview the main thing is that the API Gateway is going to route to the appropriate microservice and so the first
21:55
microservice that we're going to introduce is what we'll call this profile service and so we'll call it the
22:01
profile service and the profile service is going to be responsible for taking that set
22:07
profile API request so it's going to take that set profile request and it's
22:12
going to construct a SQL query in order to add a row to our database uh in the
22:18
profile table and so I'm going to have a profile database here database excuse my
22:24
typing and we are going to create a new row in that and now when we documented the core
22:31
entities we told our interviewer hey we're going to hold off on the data modeler schema for now because we don't necessarily know it yet we'll do it
22:37
during the highle design this is my recommendation I want to be clear this isn't the only way to conduct a system
22:43
design interview you could do it earlier if you want to and if you know the columns feel free uh I like doing it
22:48
this way because now when I'm actually um really focused on the flow of data through my system I I have a really good
22:55
understanding of what needs to be persisted here and so when that API request comes in I have this profile um
23:02
table and it's going to have the name of the user probably of course we need that but then it's going to have all their
23:08
preferences so this is like their Min age preference their max age preference
23:14
uh their gender preference gender preference um maybe like the the max
23:20
distance from them that they want to see people and of course it'll have other things but those other things are out of
23:26
scope for this interview so I'm just going to dot dot dot them so now just next to my database I know exactly
23:31
what's in this and as we continue to build the highle design if there's more columns that kind of come to mind it's
23:36
easy for me to just add them here um since via proximity they're they're close to my database so a user uh has
23:43
that post API request with some profile information it hits our API Gateway it's routed to the profile service and the
23:48
profile service uh formulates a SQL query in this case maybe I'm making the assumption that this is a SQL database
23:55
that may not be the case there's there's no right or wrong answer here um there's not going to be a ton of data
24:02
um there's not a ton of relationships so it really doesn't matter choose your database of choice um I'll paste this in
24:09
here you would never do this in an interview but I know that we have some maybe more Junior folks who watch these
24:14
and this might be interesting to them that's the SQL query that's an example of it so you'd insert into the profile
24:20
table with these values so pretty straightforward but that's what would be run from the profile service sweet okay
24:28
let's move over to our second one then users can view a stack of potential matches so this should take into consideration the preferences and it
24:35
should be close to the current users and so that's this API this G Stacks lat long
24:40
API so when that g stack API request comes in we're going to have it also hit
24:46
our profile service certainly at least for now as we're staying simple and it's just going to have a simple I'm going to
24:52
delete that it's just going to have a simple SQL query in order to get the preferences of the user and then a
25:01
second SQL query in order to get all the profiles that meet those preferences
25:06
right and so that query might look something like this you're going to have a first query that just says fetch me
25:12
all of the profile information for this user in my case user Evan and then using that user information we're going to do
25:18
a second SQL query that says well Evan wants between 25 and 35 females a little weird to say um but nonetheless you guys
25:26
get the point in the context of the system design inter of you and then we're going to do this to handle distances so we know my latitude and
25:33
longitude because it was passed in um by the API request and so we can filter um
25:38
using my max distance and the distance of wherever that that user currently is
25:44
um and so in writing this out I'll call out maybe I slightly misspoke earlier I said that we weren't going to need to
25:50
persist users locations certainly we will have to do that I'm going to abstract it away just because it's not
25:55
the most important part of the problem but maybe every time user sends their git stack with their current location
26:02
we'll save latest location and this is what we're going to use in order to
26:07
compare their current location at time of requesting the stack to the latest location of all the other profiles that
26:14
they could potentially match with That's How we'll handle that so that's what's going to happen it's going to return the
26:19
stack back to the user now really importantly um this is inefficient we
26:26
know this is inefficient we know that this part in particular of the query is super inefficient even if you built
26:32
indexes on ladin Long here uh you're using indexes that are built for
26:38
onedimensional data in order to query two-dimensional data and it's requiring a pretty significant scan of the
26:43
database and so this isn't good and it's something that we're going to optimize in our deep Dives but it's good enough
26:48
for now now a question that I often get while I'm conducting interviews is or
26:54
conducting mock interviews at least um is do I need to start start simple like what if I know the answer what if at
27:00
this point I know that I need some geospatial index or something should I just mention it and the answer is of
27:05
course you can if you know the answer then go ahead and talk about it um the reason that we start simple in the high
27:12
level design is two things one it may be a problem for which you don't know the answers and so by building up the basics
27:19
it's helping uh build things sequentially and linearly in your mind such that you're going to be able to do
27:25
those deep Dives more efficiently later on like you might not know the answer yet to put that in another way um the
27:32
other thing is that we don't want you to go too deep in a certain place early in the interview and then spend all your
27:38
time there and all of a sudden you haven't satisfied the core requirements of the system and so that's a common
27:44
mistake I see candidates make they get to this point in the interview and now they just start talking all about geospatial indexes they burn 20 minutes
27:49
or something and they never satisfied all the other requirements and then it's hard for me to pass them in the
27:55
interview because they've designed a system that didn't meet the requirement that we agreed upon early on and so if
28:01
you know the answer maybe you mention it maybe you just call it out maybe you write it down if it's quick just don't
28:07
let yourself get too bogged down here um because the negative case is like I said
28:13
that you don't get to to meet the functional requirements of the system so little bit of a rant there but hopefully
28:18
that makes sense for our purposes we'll start simple like this and at this point we've satisfied two of the main uh
28:25
functional requirements and we have two more now let's move on on to our third functional requirement users can swipe
28:31
left no or right yes and we have that post swipe
28:36
API and so what we're going to do here is that I'm actually going to add an additional micros service for this so
28:43
I'm going to move this down and I'm going to add a swipe service and so the
28:48
justification here as to why I would create an additional micros service is because the traffic patterns of these
28:55
two services are very distinct they're very different from one another in that the profile service is not going to have
29:03
nearly as many rights only when users are creating or setting their preferences and in terms of reads it's
29:09
only when we get the stack which is not going to be all that often the swipe service on the other hand for every one
29:14
of these is going to have maybe a hundred swipes because it's user swiping on a stack and so we want to be able to
29:21
scale these two Services independently basically I can have more of these as I
29:26
need to scale up since a lot is happening here while keeping fewer of these so that's the justification here
29:32
for separating them and so now when a swipe comes in we'll say that this is a
29:37
swipe with either a yes or a no and I'm also going to add a separate swipe
29:44
database and so I'll create my swipe database here I'll call it just the swipe DB
29:51
um and this is interesting and something that I get a lot from candidates as well
29:57
which is do I need separate databases um do I need a database per
30:02
microservice can I have microservices communicate with different databases and there's a lot of misunderstanding I
30:09
would even say out there in the industry there are microservice zealots who will tell you that every single microservice
30:16
needs its own database and it can't communicate with other databases it has to communicate through servers and the
30:21
reality is that's not true that information is a combination of both outdated and just like overly pedantic
30:28
that's not how systems work in the real world it's totally fine for multiple microservices to write to the same
30:33
database in case in many cases it's optimal of course there's trade-offs here um by separating out the databases
30:41
you have better fault tolerance one can go down and the app doesn't necessarily go down if another stays up this all
30:46
depends on the circumstances of your actual application um but in this case my
30:52
justification for separating out the two databases is because the requirements of
30:57
the data base are different we talked about how it didn't really matter here there's not a ton of Rights there's not
31:02
necessarily a ton of reads there's not much relational things going on here you can you can choose whatever database you
31:08
want but for this one we have a lot of Rights uh and I can actually prove that
31:13
right we can prove that because we have 10 million profiles and about 100 swipes per day on average I think we said and
31:21
so that ends up being 1 billion swipes swipes per day on average there's
31:27
100,000 swipes in a or 100,000 seconds in a day that's rounding up um and so that gets
31:34
us to 100,000 per second 100,000 swipes per second oh bad math 10,000 swipes per
31:44
second um but then we can take that 10,000 swipes per second we can call that the average and we can maybe multiply it by 10 maybe most people
31:51
swipe while they're laying in bed late at night or at a certain part of the day and so I'm sure there's some some Peaks
31:57
here maybe even some seasonality until we get to 100,000 swipes per second I
32:03
think this is straightforward enough math I'm doing it on the spot you guys will let me know in the comments if I messed it up but the point here is that
32:09
that's a lot of Rights and a good thing to understand is some of kind of the
32:15
limits of modern databases as their as it pertains to their read and write through put and so like a postgress
32:22
database hosted in AWS if you get a large instance uh and you're writing not
32:27
a ton of data how much data are we writing here right we're probably writing like 1 kilobyte of data uh we
32:33
just have two IDs maybe let's document that so we have a swipe we have the user
32:38
one we have the user two we have kind of whether or not it was a like so yes or
32:44
no uh and then maybe like some cre created ad or something so this is 32 by or 16 bytes 16 bytes a couple bytes uh
32:53
you know another what is this 12 16 bytes or so so it's less than than 100
32:58
bytes um so even less than that 100 bytes of data and we're writing that
33:04
100,000 times Peaks per second okay and so as I was saying uh postgress in AWS
33:12
you're looking at like so postgress AWS Max instance you're looking anywhere
33:18
between like 5,000 and 20,000 rights per second why the range here because it
33:23
totally depends on what data you're writing how large is the data how big is the instance in AWS like there's a lot
33:30
of there's a lot of factors here so this is just roughly rubbing it and so like we can kind of think about this as 10K
33:36
rights per second when we're dealing with a relational database like postgress notably this is per node right
33:42
we can always scale to more nodes um but this would mean that we need anywhere from like 5 to 20 nodes totally possible
33:49
for what it's worth it's not crazy um and we'll talk about in the Deep dibs maybe more about these tradeoffs but
33:55
this is totally realistic but there also exists Cassandra and Cassandra is
34:01
optimized for rights uh and so with fewer nodes we can handle the same right
34:07
through put and so maybe it makes sense then for that reason to separate this into a separate database and to have it
34:12
as a different database technology you mean Cassandra and so again trade-offs here the team needs to learn two
34:19
technologies now if we just both made these postgress that would be easier on the team but it would cost us a bit more money potentially cuz we have more
34:25
postrest nodes these are the Fun Trade us to discuss in an interview um I'm going to go with this option for now we
34:32
might change it later on but uh Cassandra it's right optimized so it can handle this peak of 100,000 rights per
34:39
second better than a postgress database for example could uh I'll link actually
34:44
in the description there's a Netflix Tech blog that's pretty great it talks about how Cassandra scales linearly with more nodes um and how they were able to
34:52
get it to 1 million rights per second for Netflix so pretty interesting read
34:58
I'm worried a bit about taking too long in this interview but it may be worth me just briefly explaining why Cassandra is
35:04
better at rights than something like postgress so I think on the spot here
35:10
I'm actually going to do that um this is going to be maybe a little handwavy obviously this would require a video
35:16
itself so I'm not going to go into too much detail on our website we have a deep dive on Cassandra so feel free to
35:22
read that but the real Essence here is that Cassandra is doing two things that
35:29
postgress isn't the first is that it's batching its rights so it's keeping all
35:35
of its rights in memory and then only when that memory kind of gets full or a
35:40
certain amount of time passes does it actually flush and then write into do an iot to disk so this makes it fast um and
35:46
then additionally that that flush to disk is just appending to the end of a file and so let me sort of briefly go
35:55
over how that works and compare the two so Cassandra what happens when a write
36:00
happens well the first thing that we're going to do is we're going to write to a log so we're going to write to a log file this is so that we can persist that
36:06
that write in case anything goes down and then two we're going to write to a mem table and so this is just writing to
36:13
memory this is just writing to memory so not to disk this one is to disk so you have one dis right and then you have one
36:19
memory right and then you can return to the user acknowledge so three act the right all done at this point and then
36:26
the fourth thing that happens is periodically we flush that memory that
36:31
mem table uh we flush memory to disk and when we do flush it to disk uh we flush
36:38
it to disk in a way that's just appending to the end of a file so right
36:43
is just in aend um there's a bit more information there I'm being a little hand wavy but like this is the Crux of
36:49
what's happening now let's compare that to postgress and so with postgress we also write to a log and call it a write
36:57
ahead log and postgress case so again that's dis but in this case now we
37:02
actually do the DB WR to disk too so this first log one again is just in case
37:08
something goes down we want to get that write down as soon as possible in case the database goes down we can recover um
37:14
but then we're almost immediately going to do the DB right now there's some caching and there are some optimizations in postgress that makes this not always
37:21
true I can hear you guys yelling at me in the comments but this is mostly true we do the DB right and then importantly
37:27
the ZB R and postgress isn't just a pending to the end of a file it's actually seeking to find the right page
37:33
where this data exists finding the data that exists in that page and then actually updating it so seeking to write
37:41
spot and changing or adding row I guess is how I'll call that um and so if you
37:48
were doing like an update to a row in postgress you need to go find that row and then update it if you're doing it in
37:54
Cassandra you're just going to add a new line at the end of the file that says I want to update this row and then
38:01
compaction is run periodically which basically takes all of these different rows and compacts them into just a
38:07
single one in order to save space so I might have gone too deep here but hopefully that helps at least a little
38:12
bit understand why Cassandra is is more right optimized it's because it both batches the rights and the rights are
38:18
quicker there is to the end of a file and so I'm going to go with uh Cassandra here for my swipe database a last
38:25
functional requirement to handle is the matching so when two users swipe right or yes on each other they match and they
38:32
get a notification so the client's going to swipe get the swipe surface um we're
38:38
going to add that swipe to the database and then we can also check is there an inverse swipe and then if there is we're
38:44
going to want to create a match first and so we could create that match in this database we create it in this
38:50
database or we could create a new database and I don't want us to spend too much time thinking about this
38:56
there's a lot of trade-offs here but it's not the Crux of this problem so I'm going to do something that might seem slightly surprising um but I'm going to
39:03
do the following and I'm going to create the match in this database down here and
39:08
so it's going to be user one oh user one user two uh you know probably a created
39:15
at time or something whatever and and the reason that I'm going to do that is just because I'm foreseeing even though
39:20
this is out of scope and not important to this problem that we're going to want to load users profiles and all of their
39:26
matches and so there's maybe a slight relation there and I can put them in the same table um it's not a big deal could
39:32
potentially put them here too we maybe want to reconsider Cassandra though it's also fine um anyway don't think too much
39:39
about this it's not the important part of design Tinder but we're going to store that match and then more importantly when we store that match
39:46
we're then going to call uh the native notification services and so the native
39:52
notification services are APN stands for apple push notifications or FC CM which
39:58
is Firebase Cloud messaging which is used by Android um and so they both
40:03
provide sdks or apis that allow us to send push notifications to users Oh
40:10
wrong one that allow us to send push notifications to users so the second person that swipes is going to
40:16
immediately get a congrats right on the client back from our response but the
40:21
first person that swiped swiped who knows how long ago and so we're going to send them a p push
Deep Dives
40:30
notification all right now it's time for the Deep Dives this is the fun stuff so we have our basic design down and now
40:36
we're going to go one by one through our functional requirements and for each of them we're going to go deep to explain how our system satisfies those
40:43
non-functional requirements now a quick note about deep Dives particularly as it pertains to your level um the amount of
40:50
depth that you go into and the amount of which you proactively lead these conversations is entirely determined by
40:56
the that you're interviewing for so if you're a mid-level candidate then there's not a lot of expectations to do
41:02
a ton in terms of deep Dives in fact it's more likely that you're not going to really lead the conversation here
41:07
your interviewer might take over they'll ask you some questions like for example how are you going to guarantee
41:13
consistency in swipes and they'll explain to you a scenario for which things might get inconsistent and then
41:19
ask for you to problem solve and try to figure out a good solution there's no expectation that you know these things
41:24
or have done these things before when you're a mid-level candidate instead we're really evaluating as the interviewer your problem solving skills
41:30
given a question giving a prompt given us highlighting what could go wrong how are you going to problem solve and
41:36
determine a solution now with a senior candidate our expectation is that you do a bit more leading here so you're
41:42
leading the conversation to at least one or two deep Dives of appropriate depth um maybe we jump in as the interviewer
41:49
and point you in the direction of a couple of things that's no problem that's totally natural um but you should be largely leading IT staff candidates
41:56
this is is where you're able to fully proactively identify where the issues are lead the conversation and go really
42:02
deep in a handful of places maybe at least two or three places like we're going to do um in this video here today
42:08
now last thing I'll say there caveat for the staff candidates the biggest mistake I see is that I think candidates hear me
42:15
give that advice or they read it elsewhere or see it in our blog posts and I do a mock interview with them and
42:20
they just ramod through the interview they're just talking fast like they're really trying to not let me the
42:25
interviewer speak because they have the misconception that if I speak as the interviewer then that's a knock against
42:31
them leading the interview and that is not true so while you're a staff candidate you want to lead the
42:37
conversation sure but it's still a conversation and a conversation by definition includes two people so leave
42:44
space for your interviewer to guide you do things like here are the three priorities that I'm going to go deep on
42:50
do you agree would you re prioritize I'm going to start with consistency I think it's interesting for this reason stuff
42:56
like that it's really important that you give your interviewer room to push you in certain directions because they
43:02
likely came into the interview with a couple key things that they really want to see and so by not giving them the opportunity to lead you there you're
43:07
shooting yourself in the foot okay so enough about that rant aside um let's get into our deep Dives and so our first
43:14
one here if we look at our non-functional requirements is we need consistency for swipes this is a really
43:20
interesting one so let me explain what the problem is here the problem is that we want to ensure that the the second
43:27
person who swipes immediately gets that Jing match on their screen that they get
43:33
the dopamine hit and feel really excited the second person will get that asynchronous notification right we've
43:38
mentioned that and so this means that if two users write or swipe at about the same time uh then if we're not
43:45
consistent we might not know that the other one swiped so let me give you a scenario we have Cassandra here astute
43:53
viewers of this video might have thought to themselves wait he's choosing Cassandra sure has white right through put but by default it's eventually
43:59
consistent so he's going to screw himself later on when he needs to talk about strong consistency and swipes to
44:05
the people who are watching that Kudos very very key observation so let's talk about what the problem is there you can
44:11
have two users swipe it about the same time and let's say that they both swipe they come to the swipe service and they
44:17
both write to the swipe DB to write their swipe then they check for the inverse swipe so maybe they just switch
44:23
their user ID and the other user's ID and look to see if that entry is in the table uh given that this is eventually
44:30
consistent it very well might not be yet basically the node that they're reading hasn't had that right propagated to it
44:37
yet and so they're going to incorrectly think that there's no inverse swipe and this is going to happen for both person
44:42
a and person B and what it will result in is both of them not getting a match
44:47
notification and both both synchronous match notification and neither of them are going to get an asyn match
44:53
notification basically we just like lost the swipe or the match forever uh because of the eventual consistent
44:59
nature we lost this match we have two people who swiped on each other and the world may never know right they're not
45:05
going to be able to find that love that they've been seeking so that's our problem and that's our problem that we
45:12
need to fix now there's three main options or three main Solutions here and
45:17
let's go through them one by one the first and this might sound like a copout but the first is let's just not be
45:24
consistent I kind of alluded to this in the nonfunction requirements that there's a world in which we're not consistent we instead prioritize
45:30
availability and the argument here and this is actually an argument I hear many staff candidates make is that if your
45:36
person B so the person who or person a excuse me the person who swiped first
45:42
you're going to get an asynchronous notification and you don't know when that other person actually swiped you
45:47
you assume when you get that asynchronous notification that they had just matched you um but we can kind of
45:53
be loose there so in that situation I just described we could have some like
45:58
reconciliation workflow which just checks the table every hour or so for
46:04
any matches that we missed and in that case send both users an asynchronous notification and they're not any the
46:11
wiser they don't know that this match actually happened an hour ago and they think that the other person just swiped
46:16
right on them and they had swiped right on them an hour earlier right so they're n little wiser and this would simplify
46:22
things a ton uh it would mean that we can stick with Cassandra we can stick with eventual consistency we can reduce
46:27
our costs we just have some reconciliation workflow so you can imagine some Kon job here that just like
46:33
runs hourly and looks from missing matches um so that's option one and it's
46:38
a valid option it's a really interesting thing to discuss with your interviewer for what it's worth now often times when
46:44
this question is brought up in an interview it's in the context of you figuring out how to handle this
46:49
consistency challenge so many interviewers might be like that's very astute that's very interesting but I'm
46:56
going to force you to handle the consistency problem right so you can't do that cop out so tactically suggestion
47:02
to you if you ever got this question in an interview I would raise that it's a valid option it's an interesting option
47:07
be prepared for your interview to push back on you and tell you that you need to handle something else so let's see
47:13
what other options we have option two we can stick with Cassandra here um but we need to get around this eventual
47:19
consistency issue and so Cassandra does have some configurations that enforce slightly stronger consistency guarantees
47:27
ultimately without going into too much detail there you're probably still leaving gaps and it might not be the
47:32
most effective solution and it's kind of you know neutering Cassandra a bit maybe that's not the right word choice but uh
47:38
you're not taking advantage of the right throughput that you wanted to take advantage of in the first place so another option that I'll see candidates
47:44
do often and is a totally valid great option is that they introduce some cash
47:50
and we can say that that cash here is reddis and now every time a swipe happens we're going to write to this
47:56
cash and our key is going to be user one colon user 2 and the value can be
48:01
anything it doesn't matter because this is essentially functioning as a hashmap so let me make this clear key value can
48:08
be anything maybe just true right and so the ordering here matters this says user one swiped on user two they swipe to the
48:15
right on user two they want to match with user two right and so now what happens is that anytime a swipe occurs
48:23
we'll write that to reddis and then we'll also check if the inverse exists so does user 2 swiping on user one exist
48:30
if it does we know that we have a match and we can trigger our match workflow and we can respond synchronously with
48:35
the match uh and then after we write to redus we'll then go still update our swipe in either case in
48:42
Cassandra and so why does this work importantly this works because reddis is
48:47
single threaded and redis has support for Atomic operations so this right in
48:54
this read can be done atomic basically they're both happening via the
48:59
same single thread and this forces serialization because what we wouldn't want to have happen is that like one
49:07
person person a reads person a reads let
49:12
me not write that out but person a reads uh person B reads person a writes person
49:18
B writes and then by kind of intertwining these read and write operations the read came up empty and
49:26
there was no match right so we need to group The read and WR so that they happen atomically and this way the the
49:33
the ordering doesn't matter whichever comes first or second is is largely irrelevant but we can't miss anything
49:38
because they're happening together if you guys could see my hands right now I'm demonstrating this well with my hands a bit harder to draw on the
49:44
escalador Whiteboard but hopefully that makes some sense here so redus single-threaded things can't happen
49:51
concurrently at least not via multiple threads and then we can have an atomic operation to user one liked user two and
49:59
read did user two like user one and if it did report back now there's one issue
50:04
that this introduced and that's that you could write to the cash and then failed to write to the database and now you
50:11
have like an incons inconsistent state by introducing rdus we have a distributed transaction now we want this
50:18
right and this right to always happen for things to remain consistent they both have to occur and so we made things
50:25
a little challenging for us eles um because we need to enforce a transaction in a distributed system and this is fine
50:31
there are solutions for this The Saga pattern let me write that down Saga pattern is a common one to enforce
50:39
consistency in distributed system in distributed system so maybe I should say
50:44
consistent transactions so I'm not going to go into detail on that here that itself would be
50:50
a whole video but take a look at that that would need to be the solution here tactically in your interview I would
50:55
want to point out that I understand the single-threaded nature and the need for an atomic right in reddis and then that
51:01
I understand that I've just introduced some issues here as it pertains to uh a distributed transaction and that I know
51:07
solutions for that maybe even just dropping the word Saga pattern would be significant enough there so that's
51:13
option two if you want to keep Cassandra the benefit here is that you still have your cheap high right through put this
51:19
is wicked fast and it's in memory It's relatively expensive it could certainly grow in size uh and we could do the math
51:26
to see how large it's going to grow but that would just result in US partitioning here probably by user one's
51:33
ID um and notably if you ended up partitioning and these two things showed
51:39
up on a different node then it would become a little more difficult to do that Atomic operation so you'd want some
51:45
partition that ensures that the reciprocals show up on the same node um so maybe you sort them first partitioned
51:51
by the sorted value anyway nonetheless so this is the this is the the solution two totally valid let's talk about what
51:59
a what a solution three would be a solution three would be that you drop Cassandra all together we talked about
52:05
in our high level design how postgress could actually work here it would just be more expensive that was our downside
52:11
right so we talked about 5 to 10,000 we probably have it here 5 to 10,000 rights per second 5 to 20,000 rights per second
52:17
it would take like 10 nodes 5 to 20 nodes or so um to satisfy our right
52:22
through put that's totally fine but the nice thing is that post postgress actually
52:28
supports um you know acid properties in transactions natively so if we did
52:34
switch this to postgress uh should I do overwrite this
52:39
yeah I'm going to overwrite this uh and then I might just control Z out so if we did switch this to postgress then we
52:45
could do something really interesting we could change a single swipe row to
52:51
instead of having two rows for each for each reciprocal swipe right we have this row Row in our cassander database if
52:57
user one swipes on two and we'd have the inverse of this if user two swipes on one we could have a row that looked like
53:03
this it could be a swipe it could be gosh it could be user one user two and
53:11
then like user one decision and user two decision right and so now the reciprocal
53:20
swipe and the you know first swipe the first swipe and its inverse are kept in the same row and so why is this
53:27
important well this means that when a swipe comes in we're going to either create this R if it doesn't exist or
53:34
just update it and both the swipe and the inverse swipe are writing to the same row and so postgress will lock the
53:42
row on concurrent rights this is something that's going to happen um automatically for you and so this is
53:49
going to cons uh simplify the consistency management a ton and ensure that post's acid properties handle the
53:55
concurrency in the the updates accordingly we're going to come in here we're going to lock this row we're going to write our value the next guy if they
54:01
came in at the same time is just going to be waiting he's going to come in after on the same row see that somebody else already liked him and Trigger the
54:08
match flow right so by updating the same row we avoid the complexities of merging records and we can easily trigger that
54:15
match flow just using post's acid properties natively pretty nice um now
54:21
we're not going to be able to handle as high of a right through put we'll need more nodes it'll be more expensive we'll not need redus anymore more so that's
54:27
great um tradeoffs here in my opinion either the Cassandra option which I'm
54:32
going to go back to here um just to make sure that we're kind of all alined
54:38
either the Cassandra option or that postrest option that I just documented are both great Solutions five out of
54:43
five if you read our answer keys um so either one works I love this conversation and the tradeoff and really
54:49
what I'm looking for in the interview is that candidates can show this depth particularly at the staff level at the
54:54
senior level I would just want you to land on one of those two options and be able to explain it fairly clearly at the
55:00
midlevel option I wouldn't expect any of this depth uh you just introducing a cash and telling me that you're going to
55:05
do the lookup in the cash not understanding the complic uh uh you know the complication that you introduce with
55:11
the distributed transaction totally fine I don't expect that you have that level of understanding at mid-level so that's
55:17
deep dive number one all right now it's time for deep dive number two so we come back over to our non-functional
55:22
requirements and we see that we want low latency stack loading so just just as a reminder so that we're clear on what the
55:28
problem is right now with our highle design when we want to load a stack of profiles that are recommended to us for
55:34
us to swipe on we call that the stack we're going to query the profile service and the profile service is going to
55:39
query the profile database for our preferences and then query the database
55:44
again to find all profiles that match our preferences right and so this is a
55:51
expensive query and it's going to take a long time to run particularly because it needs to filter by Loc
55:57
and so filtering by latitude and longitude is a two-dimensional query that normal indexes aren't going to be
56:03
able to serve well and it's going to result in US scanning a lot of rows of data doing comparison checks before
56:08
we're able to return the stack to users and so consequentially to the users that means that they're sitting there with a
56:14
little loading spinner when they're trying to find love and they want that stack ASAP but we got them just seeing a
56:19
loading spinner and that stinks so we're going to try to fix that and so again
56:25
there's a handful of options options here as well the first option that I hear candidates propose is can we just
56:32
do geo sharding can we Shard this database based on users locations and
56:37
then we'll have far less data to search over and it'll make that expensive query faster because there's less rows to look
56:43
at and this isn't a terrible intuition and in combination with some other Solutions might be sufficient but in
56:51
isolation it comes up short and the reason being is what about users who change locations as they do often you
56:58
know people go on vacation and then they're swiping on their Tinder account for that new location or what about
57:03
people who are on the boundaries then of different partitions uh you know we cut the boundary maybe at the New York state
57:09
line or something and people in New Jersey uh are still five miles from me
57:16
uh if I'm on the edge there but I'm not going to match with them at least it's not going to be efficient to match with
57:21
them cuz I'm going to need to go look at another Shard and what about highly populated areas like New York City there still tons of profiles in New York city
57:27
so it's still going to be a really slow query so moral story is in isolation Geo sharding or Geo partitionings not going
57:33
to be sufficient here what we really need to do is fix the root problem and
57:40
the root problem actually but before I go there let me propose another solution a a solution is that we can do similar
57:46
to what we do in like Tinder or or excuse me uh Instagram or Twitter feeds
57:52
and we can precompute so what we can do is every night we can do that expensive query and
57:58
we can cash it and then we can have a stack there ready for users to go so let
58:05
me propose that here I'm going to have like a uh come on I'm going to have a stat
58:14
cache and so I'm going to have a stat cache and then I'm maybe going to have
58:19
some Cron job some oops some Chron job I'm
58:25
actually going to do it here cuz I'm going to want to introduce something later so I'm going to do it like this so
58:31
I'm going to have some Cron job that's going to run every night it's going to grab all of our users it's going to run that expensive query and pre-compute
58:39
their cash and then it's going to go like this when a user wants their stack
58:45
we're just going to pull right off the cache and it's already been pre-computed so this should be like an O of one
58:51
lookup time we only have the latency associated with transferring the the size of the stack Over The Wire
58:56
so this should be super super quick this is the pre-computation approach this Crown job like I said can run every
59:03
night can run every midday uh can run you know every 6 hours whatever you want
59:08
it to be you have pre-computation now what's the issue with this approach the issue with this approach is that what happens if
59:15
something has changed that something that changed could have been somebody who's in your stat cach deleted their
59:22
profile they don't want to be seen anymore they're no longer on Tinder they already found love it could be that you've changed locations I'm no longer
59:28
in Seattle I'm in Los Angeles now and so if that's the case I was in Seattle when
59:33
you calculated my stack cash now I'm in Los Angeles and I check my stack and it's all people in Seattle what the heck is this that's not what I wanted right
59:41
or I changed my preferences I now want you know people that are slightly older
59:46
for example and I still have all those younger matches in my stack cache that would not be good and so what we can do
59:53
is we can handle the invalidation there and this is fairly straightforward and that anytime one of those conditions is
1:00:00
met like a user changes location or another user changes their preferences or whatever then we have to invalidate
1:00:06
the appropriate stat caches and there's going to be some like fairly complex is application logic to realize which
1:00:13
thatat caches those are that we have to invalidate and then for these users who got invalidated we can either trigger a
1:00:19
workflow in order to refresh them or we can just have them invalidated and then they're going to have a slow stack
1:00:25
loading time so basically take a hit on only a subset of users now even if we didn't have to worry about invalidation
1:00:32
if a user swipes through their full stack cach like let's say their stat cash is 100 people and they swipe
1:00:37
through all of them now they're going to have that long load time again in order to get their new profile and that
1:00:42
expensive query and so it's still not optimal for that reason if they're invalidated again low low load time so
1:00:50
in any of the backup cases we still have that inefficient query that we need to run so let's focus now on solving maybe
1:00:57
that root that root cause of the problem and what we can do is that we need to realize that it's the the latitude and
1:01:03
longitude query that's so inefficient and so we need a geospatial index and so
1:01:09
I've talked about this in a handful of other videos if you want to watch The Uber video you'll learn more about geospatial indexes I won't go into
1:01:15
detail about them here but what they are is a special type of in-memory index that's going to allow you to search on
1:01:21
geospatial information latitude and longitude much more efficiently and and there's different
1:01:26
ways to do this option one is that like this could be postgress and we could have What's called the postgis extension
1:01:35
and so postgress has a bunch of extensions that you can enable one of them is called postgis and it supports
1:01:41
geospatial indexing and so we could just enable it here and it's going to make things really quick at least for the the
1:01:48
the lookup on location so that's option one now there are some complaints that
1:01:53
this doesn't scale as well I think we're well within the scalability limits of it frankly if I was designing the system
1:01:59
I'd probably go that route but that's one option another option which I'll put
1:02:04
down here is to introduce a search optimized database or some external data
1:02:10
source that's optimized for these sorts of expensive queries particularly geospatial queries and so elastic search
1:02:16
has native support for geospatial queries built in and so we could just do
1:02:21
this and so now all of our data is also in elastics search and so we can go like
1:02:28
that all the data that's in our profile database will show up in elastic search at least the fields that we need to search on we can use what's called
1:02:34
change data capture here uh what this basically means and this arrow is an abstraction I want to be clear about
1:02:41
that but any change that's made to your database you have an event stream and it basically puts on a stream like Kafka
1:02:46
for example if you're using postgress Dynamo DB has Dynamo DB streams out of the box but it's going to put those
1:02:52
events on a stream and then we can have some consumer here that that for every change in our postgress database or
1:02:58
whatever database we chose here we're going to also make those updates in elastic search and it's going to make sure that the data between these two
1:03:03
things remains in sync and so this way when we search um to get our new stack
1:03:10
it's a pretty quick query in elastic search and so whether you do elastic search or a different search optimized
1:03:15
database or you do postgis extension both of them work both of them are great Solutions I would lean towards postgis
1:03:23
extension only because it doesn't introduce anent irely new data store that the team has to learn and manage
1:03:28
and all of those things but either option works and now the best solution here is that we combine these two
1:03:34
approaches and so this Cron job now can be running against elastic
1:03:40
search nightly or whatever to cach the stack and then anytime that we invalidate the stack or that a user gets
1:03:47
to the end of the stack we can just query elastic search instead of doing the expensive thing so this is our right
1:03:54
path we'll WR directly the profile database CDC will propagate it to elastic search but our git stack path
1:04:02
either hits the cache if it's there if it's not there it just queries directly from elastic search and given the
1:04:07
geospatial index on elastic search this search is going to be a lot faster than if we searched our database directly the
1:04:15
only last thing I'll say here is that there are other optimizations like while a user is swiping on their stack if there's aund thing people in their stack
1:04:22
and they get to the 90th person then we can proactive ly trigger this caching flow right we can proactively load up
1:04:30
their next set from elastic search cash it and that way to them the scrolling feels infinite they never need to stop
1:04:37
so that's deep dive number two okay we're almost there so kudos to anyone that's made it this far you're doing
1:04:43
great I know I'm throwing a decent amount of stuff at you um but really appreciate you continuing to watch and
1:04:48
hopefully you're finding it useful the last non-functional requirement here is that we need to scale so I'm actually
1:04:53
going to kind of hand wve past this one this one we've been talking about scale for all of the deep Dives so all of our
1:04:59
horizontal or all of our services they're going to scale horizontally we're going to scale up our databases and our caches as needed partitioning
1:05:06
elastic search true manage scales and clusters cash can be partitioned so all
1:05:12
of the normal stuff here horizontally scale Shard our databases load balancers
1:05:17
I think you guys know this stuff pretty well by now there's lots of resources online that can go into that I'm not going to spend as much time there
1:05:24
instead to to wrap up this video I want to talk about the constraint which we haven't discussed yet which is the need
1:05:30
to avoid showing repeat profiles and so how are we going to do this essentially
1:05:35
what needs to happen is that as our profile service is generating or our KRON job whichever one is generating our
1:05:41
stack we need to compare it to people that they've already swiped on and so one like the simplest thing we could
1:05:47
possibly do of course is just this so load the stack or the cach stack from elastic search or from the cach into the
1:05:53
profile service query for for everyone they've ever swiped on and then compare them in memory remove the ones they've
1:06:00
swiped on and return back to the client for a mid-level interview this is great it works no no worries it's not very
1:06:07
efficient so we're going to talk about things that we could do better for those staff and or senior and staff interviews
1:06:13
um but that is the viable simple option that you should certainly always raise in the interview now the other thing that you
1:06:20
could do is that we already have this cash here um so we could use this this
1:06:26
cache we'd probably need a different key value pair because the this isn't going
1:06:32
to be efficient for us to be able to get everyone that user one has swiped on because the key is user one Co and user
1:06:38
2 right so that's not going to be an efficient lookup because this is like a hashmap style lookup so maybe within
1:06:44
this cache we introduce a set uh where the key is the user and the value is
1:06:52
everyone that they've swiped on and so the value is this set of other people
1:06:58
getting a little tight on Space here but hopefully you guys are following that and so instead of quering that database
1:07:04
which would have been slow we can query the cache and do the same thing that was mentioned there this can either be an
1:07:10
arrow oh I just had something pop up on my screen I don't know if you guys could see that or not uh but I'll keep going
1:07:17
here um so we could have this arrow to the profile service also to the Cron job
1:07:22
when it does the pre-computation either way but we hit this cache now what's the potential limitation here
1:07:28
so if we have this cash um we have 10 million daily active users we said that
1:07:34
they swipe so I'm going to come down here we have 10 million daily active users we said that they swipe on an average of 100 a day um we said it was
1:07:41
100 bytes so 100 bytes per entry there or in this case um each entry is just an
1:07:48
additional 16 bytes but anyway I'm still going to round up 100 bytes let's say 365 days that's 30 36 36.5
1:07:58
terabytes uh yearly right so every year we're going to add 36 36.5 terabytes to
1:08:04
this cache caches a huge cash is like 128 gigabyte
1:08:10
cach most AWS caches are smaller than this right 32 64 gigabytes or something
1:08:15
respectively so this is going to take a ton of instances of this cash and that's going to be pretty expensive uh it'll be
1:08:22
fast because it'll be partitioned by the user ID so that's not a problem but it's just going to require a lot of hardware
1:08:28
and a lot of caches so can we do something better well we can and there's
1:08:35
two things that we can do better either we speed up the query to the database or we reduce the amount of space needed in
1:08:43
the cache to speed up the query on the database we could of course just
1:08:48
introduce a index and so uh whether postgress Cassandra we can have an index
1:08:55
on user one and that'll make it at least a lot quicker for us to do this query
1:09:01
and so that's good and is a totally viable approach probably the simplest option maybe even the best option to be
1:09:08
honest so that's one thing we can do the other thing we can do is try to make this use less space and so the option
1:09:14
there is that this 3 36.5 tabes is too much so maybe we introduce a bloom
1:09:20
filter and so Bloom filters I'm not going to go into too much detail but go ahead and Google it on your own they're
1:09:26
space efficient data structures and they're used to quickly check if an element is possibly in a set so just
1:09:33
like how sets have dot contains that are o one similar here in a bloom filter the difference is that it's a probabilistic
1:09:40
data structure so we reduced the space tremendously and in doing so uh we
1:09:47
introduced or we reduced the accuracy or the Precision so with a bloom filter it's just like a set but it takes far
1:09:54
less space but now when you check if something is in a set there's a small chance of a false positive but you
1:10:00
cannot have a false negative and so what this means is that it might return to you yes something is in the set and it
1:10:07
might be lying to you and so in our case that might be fine because most of our checks are going to be no that thing's
1:10:14
not in the set right uh and in the case that it is yes it's in the set then we can just confirm that it actually is by
1:10:21
quering our primary database right we need to double check since there's that option of false positives now in my
1:10:27
opinion this is like slightly over engineering um I probably wouldn't go
1:10:32
for this approach I think the index approach is fine especially since we're mostly handling everything pre fetching
1:10:39
so even though this introduces some additional time uh it's not horrible or the end of the world and I'd rather
1:10:45
avoid the bloom filter which itself still is going to be that large it's still going to be really large here um
1:10:51
that's my personal opinion either option works in the interview these trade-offs are which great the last thing I'll say
1:10:56
is that staff candidates often times will have the confidence to propose that we just adjust the constraint and so the
1:11:04
constraint if you remember was avoid showing repeat profiles but many staff candidates I interview will say something like this they'll say well
1:11:10
actually wouldn't it make sense if we show repeat profiles again after say a month and what this will afford US is
1:11:17
that we can clear out our cash after 30 days basically get over this 36.5
1:11:23
terabyte issue because now we're going to have far less data in the cash we only need to keep the last 30 days and from a user experience it's probably
1:11:29
better anyway things might have changed in 30 days your opinion of somebody might has changed their profile might
1:11:35
have been updated or otherwise maybe it's not 30 days maybe it's 60 90 whatever but this is a fantastic
1:11:41
proposal and it's the sort of thing that you would do at work a PM comes down
1:11:46
with some constraint or some requirement and you as the engineer can push back on them and say actually I think this make
1:11:52
might make more sense both for our user and and from a cost efficiency perspective it's a great option so
1:11:58
that's another thing that could be discussed here but ultimately with this deep dive you're trading off the space requirements and the efficiency in order
1:12:06
to do those check and that's what we would want to hear
Conclusion
1:12:12
about all right there we go at this point I think that we have designed a pretty good implementation of Tinder um
1:12:18
and if you follow the leveling guidance that I gave throughout you'll know what exactly would have been required at each level if you're somebody who just fast
1:12:24
forward to the of this video and you're looking at it and you're thinking I'm a mid-level candidate this is a lot watch the full video this this this isn't
1:12:31
expect at all from a mid-level or even senior candidate we we went into depth um in all the places that we could or at
1:12:38
least a number of them um anyway Kudos if you made it this far this ended up being a long one let me know how you
1:12:44
feel about the length I think this is 15 minutes longer than the previous ones I usually try to keep them an hour I know
1:12:50
that I went on some spur the- moment tangents throughout in this one let me know if those were good useful if they
1:12:55
were bad ultimately I just want these videos to be as useful as possible to you all so uh let me know in the
1:13:00
comments also leave any questions call out anything I did wrong as always I'll be trying to respond to comments as best
1:13:07
I can um lastly again check out our guided practices uh where you can try
1:13:12
this question on your own or consider booking a mock interview with us at hello.com but until next time good luck
1:13:19
with your preparation and thanks everyone for watching