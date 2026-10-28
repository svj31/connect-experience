Intro
0:00
I'd like you to design either Tinder or Bumble take your pick [Music]
0:07
hi everyone and welcome to another mock interview with exponent today I'm here
0:12
with Yen Lee Yan you want to introduce yourself yeah hi everyone I'm Yen I'm currently
0:18
working as a senior software engineer at Tech talk um we're on the mobile reliability team
0:24
and previously I was a meta for four years working on Android messenger and
0:29
also arvr for the Ray-Ban stories of Facebook released
0:34
um yeah I'm happy to be here uh doing a mock interview awesome we're happy to have you so my
0:40
question today for you yen is I'd like you to design either Tinder or Bumble take your pick before I jump straight
0:47
into the design uh let me go over the functionalities
0:52
and requirements so um I would like to list out kind of like
0:59
the functionalities that we're going to be touch on uh today so for example I think that
1:07
when I think of a app like Tinder I am thinking about like
1:12
a profile that will probably be creating when the user first joined
1:20
um and probably like a feed slash recommendation
1:28
and then like matching so like this swipe right and if two users write swipe
1:35
right on each other will be uh matching that to users on the back end
1:40
and then lastly private messaging so once two users are matched they'll
1:47
probably be creating a thread for texting and exchanging messages uh
1:54
possibly uploading images or videos in their private inbox so images videos
2:03
and then uh just kind of going a little bit more detail on the profile creation
2:10
I'm probably like a bio so like preferences and then uh images for the their
2:17
profiles and then potentially videos maybe that's an extra
2:22
um so these are kind of the core uh
2:27
functionalities that I'm thinking of let me know if I'm missing anything I think this is a good start yeah okay
2:36
um and then maybe I can uh uh here I can maybe add like a little
2:42
extra if we have time so something like super alike that I so I personally
2:48
not been an active user of Tinder but I kind of know what super luck is but
2:55
um and then system monitoring like logging just kind of Health uh state of the
3:03
overall system and then maybe like a subscription model uh which I assume is
3:08
how they actually monetize their platform yeah yeah and then I'm curious I'm curious why
3:15
system monitoring and logging is under is under extra like what What affected that decision to put it there
3:22
um so it's more for the sake of the interview just because I think logging system and monitoring is pretty much
3:30
like its own sort of like design and um for the sake of the interview I uh I
3:37
think it's a core component but I I don't know if we want to dive super deep into this part of it but
3:44
yeah okay sounds good so next I think we can discuss a little
3:51
bit about the traffic so traffic I think roughly I'm thinking
3:58
um from like a social media app perspective I'm thinking maybe they have 50 million users
4:05
um maybe uh I'm just guessing here a million active user per day
4:13
so uh not everyone is actively using Tinder but there can be only 50 users
4:19
registered um and then let's say 500k new profile I
4:24
might be underestimating numbers uh created and then
4:30
like a billion matches per day let's say
4:35
um the number is kind of roughly estimated
4:40
uh it could be a little on the lower end um but essentially this should let us
4:49
uh have a little rough estimate on like the storage that we need for all the
4:56
images for the profiles so let's say there is 50 million users and 1 million
5:02
active users and let's say like 500k new profile create every day then uh I think
5:09
we can probably do some calculation on uh the photo storage so for in terms of
5:15
profile uh uh photo storage let's say
5:24
um 200k um per photo and then there's
5:31
let's say on average six photos per user and then
5:37
there's uh 50 million user roughly and then
5:42
plus like the 500k new profile created uh I think roughly
5:49
um we'll be looking at like
5:59
like 300 um 300 to 600 TB I think
6:10
um and then for messaging there's probably way more here
6:16
so I think for messaging we can say there's 200 million messages Exchange
6:24
and um 10 million photos uploaded every day
6:31
and then we can do more deep dive into like the storage part when we get into that section of the design
6:39
um yeah overall I think this is kind of the background functionality and
6:44
requirements that I'm gonna base off of my design if uh do you have any other questions before I dive right into the
6:50
design portion no I think we can again we can dive in
6:55
so let's start with the let's just go down from like the the list of uh
7:01
functionality here let's go from profile creation so
Profile Creation and Storage Flow Overview
7:06
um here I think we're thinking of creating a profile and then
7:12
um let's say we need to upload the images and also
7:19
creating storing all the preferences and like the bio information
7:24
so um let's say from the client perspective we'll start from the client side so
7:31
client said the app and I think that
7:38
the flow that I'm thinking of is when user are kind of setting up their
7:44
profile they'll be uh kind of answering a series of questions so those are kind of like in
7:50
like a text form with like I'm thinking like a Json format but then they'll also
7:56
be uploading images so what I'm thinking is they'll probably first need to upload
8:01
images before they can actually successfully store everything together so
8:09
um hear the flow the general flow that I'm thinking of is they'll probably need
8:14
to upload and their profile images to like upload services
8:20
and then um then it touches like the application service
8:25
so this will be sort of like uh transcoding the images or resizing
8:32
the images to make sure that we don't store like the original size and we can save a little bit of space and then
8:38
doing some other kind of processing on the image to
8:43
ensure like whether we want to filter or do some encoding or something and then we can store it into like a
8:50
back-end blob storage um and then this is kind of like the
8:56
image Pipeline and I would assume that it would kind of return back some sort of image ID for each of the images which
9:04
we can use for the overall profile of
9:09
Json metadata so I think here uh before I dive into the design of the whole
9:16
profile image I'm just gonna outline what like a profile data kind of
9:22
looks like so for profile data I'm thinking there's going to be a profile ID which is the
9:29
string and then user ID
9:34
uh also a string and uh just secure kind of noting that I
9:42
have a profile ID and a user ID because uh if the user decides to delete their
9:47
profile once they do find like a partner and then if Unfortunately they
9:53
emotionally need to break up with them and recreate a profile uh they'll be a different profile ID for the same user
9:58
correct and then for preference um there's another layer of um
10:07
Json so like for example gender uh string
10:12
and then if they have like a low like a h-bound
10:18
preference um
10:23
and then other kind of file preference that they have
10:28
um I won't list all of them and then some sort of Bio information about themselves
10:35
uh so their own gender age
10:43
and then location information
10:49
and then maybe other types of bile information
10:55
and then photo IDs which will be
11:03
just a list of IDs so the list of IDs are coming from the
11:11
back end server once the uploads have been successful so only when they are
11:16
able to upload their profile images while we actually finish filling out
11:21
this profile data and then um once they do that I think we can go
11:29
ahead and kind of fill up the second part of this pipeline which is uh
11:35
creating that profile into inserting that into the profile database
11:40
so again I think here uh
11:47
there's kind of like two and so profile user profile DB which I'm thinking of
11:56
using sort of like a a nosql database uh to Pro uh to kind of
12:02
capture this uh kind of unstructured sort of Json format Okay so
12:10
here they would go from
12:21
some sort of like a htvd post request
12:28
and then um to the application server which will
12:39
uh end up storing do any sort of processing it needs to
12:44
um this sort of General lines which uh we can dive a little bit deeper but it
12:49
will end up storing into um
12:55
the profile DB and like I mentioned earlier like this is also
13:03
like where we would be talking to like encoding service for like the
13:18
um for the uploading service okay so this is pretty much like the general
13:24
design flow for the profile creation and then um I think I will go on to the
13:30
next part which is feed and recommendation and um I think after we've gone through kind
13:37
of all the core components we can go back and talk about like scalability adding load balancer or like additional
13:44
cash memory caches stuff like that um yeah so the next part is uh
13:51
let's see feed recommendation so uh this part I think I kind of want
Feed Recommendation Requirements for Active Users
14:00
to talk about sort of like the uh small many requirements of this area so
14:09
um we want to first kind of like talk about General requirements of like
14:15
our feed recommendation we would like to recommend
14:20
um sort of like local users so we don't want to recommend
14:27
people who are kind of across the globe and we also want to show active users
14:33
so uh like I mentioned earlier there could be like 15 million registered users and some of them are within your
14:41
area but they are not actually actively using so we do want to make sure that we're showing active users when it when
14:48
it comes to feed recommendations yeah and we also want to make sure we balance between
14:55
kind of like showing too many um matches versus not enough matches for
15:01
each user so what that means is uh sort of like if
15:07
one user is getting too many matches um then we kind of want to make sure that they are not uh getting recommended
15:15
even more um and whereas some people are not getting any matches so we want to make
15:21
sure we are focusing on uh adding more kind of like
15:28
um I guess like reducing more uh requirements so reducing some of the
15:34
filters or kind of loosening up those requirements when it comes to the recommendation
15:40
um algorithm okay um is that is that like a product inspired
15:46
um direction that you're going in yeah yeah okay and this could be kind of an extra thing
15:53
but uh just kind of listening now and then maybe some sort of like so I think we want to prioritize either
16:00
kind of like pretty fast recommendations So like um
16:05
there's always like new matches or sorry new recommendations showing up so low
16:11
latency versus kind of real uh time
16:16
match uh recommendation I just say so this is kind of like where do we want
16:23
to prioritize do we want to make sure that there's more recommendations coming in once a
16:30
user kind of like swipe all that their profiles or do we want to make sure
16:35
there are more users of the uh kind of newly created profiles that are showing
16:42
up so I think this is something that we can discuss a little bit more I'm more leaning towards low Lindsay just because
16:49
I feel like it doesn't really matter if we're kind of late to some of the newly created uh profiles if we eventually
16:57
will show them but that is something that we can decide yeah so
17:04
yeah so these are some of the things I'm gonna kind of keep in the back of my mind when I'm
17:11
um designing this part okay um yeah so first I would like to kind of
Recommend Local Users Based on Geographical Location
17:17
talk a little bit about how we can recommend the local users so one thing
17:27
we can do is to kind of do like a database sharding
17:33
based on geographical locations so since every user has provided their kind of
17:38
like location so latitude and want to do we can use that information to sort of
17:45
do like a Geo sharding when it comes to a database
17:51
destroying their bio information when um when they are creating their profiles
17:56
so using this sort of approach we can then
18:03
perform a pretty fast look up and also make sure that we only
18:09
retrieve information related to users that are surrounded by you
18:15
and let's go ahead and sort of map out this
18:20
design again we have the client
18:26
the app and then
18:31
let's
18:37
uh this way so
18:47
so we have a recommendation service okay
18:52
which uh the client will be sending like a request so
19:01
it's for a recommendation list
19:09
and then so this part
19:14
um I think uh to make things a little bit easier if you all understand we can
19:20
go with a Geo sharding mapper okay so this uh allows us to kind of
19:28
quickly grab or store file into the correct
19:36
um Shard and essentially it's using um users latitude and longitude to kind
19:44
of um uh store like a mapping between that and
19:50
the sharding index and be able to kind of correctly figure out which Sharda we
19:56
should be uh talking to okay and then
20:02
um so this can be so so essentially the
20:10
shorting mapper is kind of like a more like a wrapper interface to kind of
20:16
talk to a an actual Library so for example we can use
20:23
um like Google S2 is one of the I think popular Geo sharding uh database that we
20:31
can be using so here we can kind of uh use that as our actual
20:38
uh storage for achieving the Geo sharding and the geosharting mapper will
20:43
just kind of directly talk to Google S2 and store file into the storage or get
20:50
all the shards uh needed and then um and I think that it will also just kind
20:58
of talk to the shards so essentially here the uh design is that
21:07
we will the client on the app will send like a get request for the recommendation list uh providing
21:17
latitude and long and then the Geo
21:23
um and the recommendation service will kind of send the location
21:30
and other information needed over to the geosharting mapper
21:36
and so here we have
21:42
Zen thing location slash other info
21:48
and then
Google S2 and Geosharding for User Recommendations
21:56
so here we kind of get all the shards
22:02
needed for the current uh location so for example if we are looking at
22:10
a user base in New York and it's the city is pretty dense so I would assume
22:16
that uh there might be multiple uh cells or servers uh
22:22
storing relevant information that will be needed for the user to use for the
22:29
recommendation service so here we can access that by just talking to the US to
22:34
interface and it will kind of access the right shards for us and then come back with the
22:40
uh store information so okay
22:49
so uh kind of making that into a more explicit
22:55
API so we can say get recommended feed is our end coin
23:02
and then we provide the user ID
23:09
a profile ID
23:17
so here actually if we think about it we uh request send get requests so instead
23:25
of providing the lists we can just provide simply the user ID and the
23:30
providing of the of the clients that you're sorry of the um users that you're returning
23:36
from the recommender uh so so no so we are providing the
23:45
um the user ID and providing of the user that we are currently
23:50
um requesting the recommendation list from okay and then so by providing that it will
23:58
send it to the server for the recommendation servers and then they will use their user ID and profile ID to
24:05
retrieve the relative uh information store on the server side so if they're providing uh information
24:13
has all the uh file information so for the locations of it will retrieve that
24:19
recommendation and then send the location and other info information to the Geo sharding mapper which will get
24:26
all the shards needed and then come back with a list of the uh
24:32
other people users information back to the recommendation service and then it
24:37
will do filtering on that so let's talk a little bit more on the recommendation
24:43
service okay
24:51
so this is the get request it will send and then
24:57
um I think the response that we are hoping for is
25:03
simply like a list of profiles that we wanna
25:11
uh display and um a profile is simply I think earlier we
25:19
had sort of like uh defined that here so if we can grab Alyssa profiles that
25:27
we need to share to this user's fee then uh on the app and we can just simply
25:33
display that into a UI so for the recommendation service um let's talk about what we need to be
Recommending Users Based on Preferences
25:41
doing so we need to develop a strong kind of algorithm to filter out
25:47
um sort of like a giant list of profiles or
25:52
bio infos return back from like the Geo sharding mapper
25:58
um and I think let's list a couple requirements
26:05
what the recommendation service is actually doing so okay um um the first one is we need to make
26:13
sure all the profiles being displayed on the feed is uh fulfilling
26:21
the current users
26:27
preferences so remember when we were defining kind
26:33
of like the profile every user has like preference that they can set so as part of the recommendation service is to make
26:39
sure we are filtering out the um
26:45
the profiles that are not meeting these user preferences and then
26:51
we should also only include active users
26:57
so what this means is any users who have not been you using the app for at
27:06
least more than um within like five days for example we
27:12
will be filtering them out so filter out any user who
27:18
has lost logged into the app more than
27:26
X days ago okay so um this can be part of the profile
27:33
information that we get in the back end where we are storing any
27:38
um login information so when the user login will do like a push to the server to
27:44
update their profile and add like a lost login field with a server time okay and
27:51
then this will allow us to also recognize who are the active users
27:57
um and then we should ensure that um
28:02
the list has like a higher limit so for example we don't want to be
28:09
um we don't want to be returning back like 2 000 um profiles back to the user
28:16
because then they will not be able to like half the time to scroll all of them and by
28:22
the time they go through all of them it might be kind of old stale so hardly
28:28
limit on the return count so let's say 50 is the count
28:37
okay could be dynamic set by a setting so um sort of like
28:44
very basic and I think that uh let's go back to what we have here we are
28:51
recommending local users so by using the Joe sharding algorithm we should be able
28:57
to achieve that show active user so this is a part of the recommendation services
29:03
uh balancing between matches so this is something extra that we have not been touching on so this can also be included
29:09
in part of the recommendation service where uh users are also filtering
29:14
through to make sure that they've only been um
29:20
they've only been matched a certain number of times otherwise we can have a smaller limit on the uh returning count
29:27
a low latency versus real-time recommendation I think by using the Geo sharding algorithm I think we will
29:34
achieve pretty lowly and see just because we will also always be accessing uh the shards that are relevant to us
29:42
yeah I'd like to hear a little bit more about this low latency decision so I remember you touched on a little bit
29:47
earlier what factored into that decision that you made yeah so I I guess this is kind of like a
29:55
personal decision on on this but just kind of breaking down the two different
30:01
approach so low latency versus real-time recommendation so low latency uh is sort
30:07
of like when it comes to the app uh kind of running out of recommended feed so
30:13
when the feed is kind of empty when you have no longer any profiles to swipe on
30:18
um when the fee needs to retrieve more recommended uh lists I think when it
30:24
comes to low Lindsay versus real-time recommendation real-time recommendation uh sort of requires like a set of
30:33
different um algorithm and um storing mechanism where could you
Low-Latency vs Real-Time Recommendation
30:40
define could you define the two first uh the two like what it means yeah like
30:49
what is the product behavior on either of these options sure so low latency I think it means
30:55
when you are running out of uh recommended feed for example if the user
31:01
swipes left uh just really fast and went through all of their feed entirely in
31:07
like a very short amount of time and um the app needs to request a
31:13
recommended list from the server and this the waiting time here if it's
31:19
for example if it's under um a few seconds
31:26
um let's say 10 seconds um I think I would say like within a
31:33
couple seconds it's all pretty relatively low latency when we're talking about
31:38
such large scale and doing sort of back-end processing on filtering and
31:44
everything so I think within seconds user can kind of go back to swiping
31:50
versus real-time recommendation I'm thinking of uh where the the back end
31:55
needs to do more processing and could take up to minutes to kind of curate a more real-time
32:02
recommendation on user who are both relevant to you but also
32:08
uh have like new profiles created and why are we why do we care about the
32:14
new profiles created is that because they've just run out of people in the geographic area that they've specified
32:20
yeah I think the new when it comes to real-time recommendation like new profiles
32:27
I think it matters to Tinder or like kind of dating app just because
32:33
um it kind of ties into the active user part where uh we need user who are
32:39
actively using and who are fresh to the app as opposed to people who could be
32:45
kind of like three day oh or um not actively using the app
32:52
um to create like more matches right so the point is creating more matches got
32:58
it so we're saying we're optimizing for even if it's like you know people who are not Super Active even if it's not
33:03
the best match for you we'd rather just give you people ASAP for you to see beyond the initial list that we gave you
33:10
then make you wait for the best possible matches yeah yeah got it okay and and I
33:16
think the decision is kind of subjective I I would say I I think in general from
33:21
like the social media aspect I know that uh at least from my experience uh people users are pretty impatient so
33:30
um kind of design that I've always opted for would be kind of like low William Siva sacrificing the quality of the
33:36
algorithm uh result here okay yeah that's fair yeah
33:42
so yeah so that's uh kind of where I was
33:47
going with and uh let's see yeah so going back to the recommendation
33:54
Service uh these are kind of like the base basic algorithm uh filtering system
34:00
we have and then um we can add a bit more on the
34:05
balancing between matches and then the lowland C versus real-time recommendations when it comes to uh
34:12
using the Geo sharding this is a good place to stop stop much yen
34:19
post no I think that I this does a huge space
34:27
like I mentioned I think monitoring and logging is like a whole other area yeah if for people who gets broad
34:35
questions like these in their interviews what are what are your recommendations to them how do you recommend they
34:41
approach it um yeah I think I would always go from
34:46
kind of big to small so breaking down from the general requirements
34:52
functionalities and focusing on a couple components and then from there kind of
34:59
apply the same thing just kind of breaking down um like here I think even in this space
35:05
I was doing breaking down into kind of different components and different requirements within each of the these
35:12
sub-components and then focusing on different things and I think as an interviewer I would
35:19
also kind of do the same thing if the interviewee is kind of focusing on
35:24
something and going too deep into one thing kind of pull them back and ask about something else or kind of hint
Core Functionality for Dating App
35:32
towards like okay let's what about this other core functionality that you mentioned yeah yeah okay that's great
35:39
thank you so much yeah and it was wonderful having you um and I hope people are able to use this to build their own dating app so
35:45
we'll see foreign [Music]
35:53
foreign