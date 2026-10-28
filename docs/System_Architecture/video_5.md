Intro about Series, Myself & Why this Series
0:00
Hey everyone, welcome to another video.
0:02
So if you guys are again wondering how
0:04
does the system design of bumper looks
0:06
like or you're curious to learn then
0:08
this video is going to be for you. So uh
0:11
before we get started if someone is new
0:13
to the channel I would just like to give
0:14
a brief intro about me and then the
0:17
channel. So uh my channel generally
0:20
talks about DS and design. Who am I? I
0:23
have more than 2,000 rating on lead
0:25
code. I am working at Microsoft and last
0:27
year when I went on a switch journey I
0:29
received 10 job over job offers
0:31
fortunate enough and during that time as
0:34
I appeared for SD2 I had close to three
0:36
years of experience and then HLD high
0:39
level design was one of the main rounds
0:42
that was there in almost all the
0:43
interviews. So probably out of this 100
0:46
I would have I would have given like 20
0:48
25 HD and I failed only one or two and
0:51
during those time I have learned quite a
0:54
few things. So this is going to be
0:56
around that, right? And if someone is
0:58
new to the channel, I would again
0:59
suggest watch at 1.5x and then we do
1:02
have a live stream at 10 p.m. every day,
1:05
right? Uh to just a little bit on the
1:07
offer. So these were the some of the
1:09
companies where I was able to get offer
1:11
and these were some of the companies and
1:12
more where I was rejected. But I did
1:15
went through all the loops in these
1:16
companies also. So the video experience
1:19
or interview experience is on the
1:20
channel. Feel free to give it a go.
1:24
Okay. So coming to system design on this
1:26
episode 4, right? So uh today we are
1:29
going to talk about Bumble, right? Uh so
1:31
if anyone is not aware about what Bumble
1:34
is, right? So Bumble is a dating app. Uh
1:37
it's a dating app uh where
1:41
users or you can say people can connect
1:45
with other people, right? Based on
1:51
the swipes, right? So basically you can
1:53
swipe right if you like someone and if
1:55
the other person also does the swipe
1:58
right so then basically it's a match
1:59
right and then you can talk to each
2:01
other meet each other if your luck falls
2:03
out right so uh so that is the bumble
2:07
right I think if you are not heard of
2:08
bumble tinder is also there and then
2:11
other applications like hinge is I think
2:14
these are also there right so what is
2:16
this system design only series about
2:18
right just a one minute time on that is
2:21
so this video like covers high level
2:23
approach because I have read so many
2:25
articles I have read system design books
2:27
I have read different I have followed
2:29
different websites right all of those
2:30
are good but one thing is that all of
2:33
those are more than one hour video let's
2:35
say if you're watching for the first
2:36
time or if you just want to go do a deep
2:39
dive right you have lot of time on your
2:41
hand right then those are like the best
2:43
resources out there but let's say you
2:45
have already done now you want to revise
2:47
it right at that time there are not many
2:49
resources and this is one of the idea
2:51
that I got that what if we can summarize
2:54
a design or if we can like collaborate
2:57
all the knowledge in 20 minutes so that
2:59
if you watch this on 1.5x so you can
3:02
probably spend 10 to 15 minutes and then
3:04
the topic is revised for you right so
3:06
that is the aim there now I've already
3:08
spent close to 3 minutes so we'll not
3:11
spend more time and then we'll get
3:12
started to the problem statement so I
3:15
would suggest watch till the end and let
3:16
me know if you have any comment in the
3:18
feedback in the comments right so coming
3:20
to uh what this is right so this is like
3:23
fully prepared you right this could be
3:25
you now what you learned and what you
3:27
get asked is a very different things
3:29
right so that's what I will spend so
3:32
everything about design revolves around
3:34
so in a design interview you can talk
3:36
about functional requirement you can
3:37
talk about non-functional capacity
3:39
estimation database schema API design
3:42
highle design component deep dive
3:44
scripts so the scripts is something that
3:46
I have designed so caching replication
3:48
indexing sharding whatever right you can
3:50
talk about All of these things right and
3:52
you learn in this way also all the
3:55
websites all the articles right they do
3:58
teach in this format which is really
4:00
good but in my 20 interviews of HRD
4:03
right I have never been asked everything
4:06
around this because it is not possible
4:08
right so what actually in an interview
4:11
setting happens is based on my
4:13
experience is that you are given a
4:15
problem statement and then you have to
4:16
come up with non-functional and
4:18
functional requirements right functional
4:20
first and then non-functional
4:21
And then the interview straight away
4:23
asks to do the highle design right there
4:26
is no they always say that it has
4:28
happened with me they always says that
4:30
database schema API design capacity we
4:32
can come to that later that is like you
4:34
can come to that later but let's move to
4:36
the highle design right but it is tough
4:38
to move that higher level design be
4:40
before designing at least the core
4:42
components of the system right so that's
4:44
why uh what I'll be doing is I'll be
4:46
talking about these things only right
4:48
and so if you if you or your interview
4:51
is coming close then you can just use
4:53
this as a quick revision right or if you
4:56
have never seen how does the bumble
4:58
design looks for you then this is really
Functional and Non Functional Requirements of Bumble
5:00
going to be for you okay with that said
5:03
let's start with our functional
5:04
requirements right so what are the
5:06
functional requirements of a system like
5:08
uh bumble right so a user can create a
5:11
profile right so first thing user can
5:14
create a profile with photos preference
5:16
let's say I'm going to bumble I can
5:17
upload my profile and I can get four to
5:20
very fashionable or fancy attractive
5:22
pictures which will attract the other
5:24
gender right so and then you can also
5:26
have your interest and you'll have to
5:27
enter your age and the also the age that
5:29
you want to get matched with right so if
5:32
I take example of mine anywhere from 18
5:35
to 30 30 35 anything right so uh I just
5:39
want to make this video fun also don't
5:42
kill me in comment so uh so now in that
5:44
also you can also specify a match range
5:47
so if let's say I'm in Punjab I would
5:49
want some match to be around Punjab not
5:52
somewhere in the south right or not
5:53
somewhere in the Bangalore right so
5:55
that's another match distance right and
5:57
then so when I open a bumble I have
5:59
created a profile now I should view see
6:01
a view of stack so that I can either do
6:04
a swipe right or I can do a swipe left
6:06
right with respect to their preference
6:08
and it should be based on my preference
6:10
right if I like the opposite gender
6:12
right then it should be from that gender
6:14
right based on my preferences and then
6:16
user can swipe right I can I have the
6:18
power to do swipe right and left which
6:20
is just a boolean yes or no and then if
6:23
let's say I liked someone and the other
6:25
person has already liked me so then it's
6:27
a match right we both have swiped right
6:29
so it's a match in that case so that's
6:32
the functional requirement right and
6:34
this is something that you will have to
6:35
come up yourself only problem statement
6:38
that will be given by the interviewer is
6:40
that design um design bumble or design
6:44
any dating app right a name could be
6:46
changed but it would be just a dating
6:48
app Right now this is the features of
6:50
the system right so but what next we
6:52
want to talk about is what are the
6:54
non-functional requirement right so if I
6:57
have to distinguish in between these two
6:59
so the functional requirements are what
7:02
the features of your system right what
7:04
the system is supposed to do and
7:06
non-functional requirement is like how
7:08
part of how it will do all that of stuff
7:10
right so now for this also generally
7:13
non-functional requirements it revolves
7:14
around these three cate four six words
7:17
that I have created ated LCS, DFS these
7:20
are very popular in terms of data
7:22
structures but here it has different
7:24
meaning. So L stands for low latency
7:27
right and L so low latency where right
7:30
so where do we need low latency in
7:32
Bumble so when I open um my Bumble app
7:35
right I should see a stack of people
7:38
fairly quickly it should not be like
7:39
that I'm waiting for 10 minutes and the
7:41
stack is empty maybe I look that bad
7:43
there is no one that is being that is
7:46
similar to me that is a separate case
7:47
but still in that case also we should
7:50
show some people right it should not be
7:52
like empty because that will give a bad
7:53
user experience
7:55
Now coming to so see so this LCSDFS you
7:58
don't have to point this out to the
8:00
interviewer this is just for you to
8:02
remember which areas that you have to
8:04
tackle in an interview right coming to
8:06
cap theorem right so again if you don't
8:08
know about cap theorem please go read
8:09
about it the aim of this video is not to
8:11
teach you cap theorem but there is a
8:13
concept uh design concept cap theorem
8:17
that you should be aware about now in
8:18
this we have to choose cons e either
8:20
consistency or availability because
8:22
network partition is given So here what
8:25
I'm going to choose is consistency
8:27
because if let's say I have given yes to
8:30
someone right that yes should never be
8:32
lost right so for example what I mean by
8:34
that is that if I have put a yes to
8:37
someone and simultaneously someone also
8:40
added a yes to me right so then that
8:42
becomes a match now if both of those yes
8:44
are not saved and not um compared at
8:48
that given moment so it will result in
8:50
that the system is not consistent and um
8:53
Even though we both said yes but uh it
8:56
never resulted in a match right. So
8:58
because we never prioritized right over
9:01
read. So that is the uh consistency over
9:05
availability and scalability is pretty
9:07
straightforward. You can come up with uh
9:09
this numbers and then based on the
9:11
population and then you can say that
9:13
okay 10k requests per second. So I
9:15
always kind try to generalize it with
9:17
10k because 10k is a fairly good number
9:19
in any system right. uh again I I have
9:22
like I have never seen interviewers
9:24
being stuck on this because they know
9:26
they do know that we have to create a
9:28
scalable design. So not many
9:30
interviewers really care about this
9:33
right but still if it comes up you
9:35
should know right and then the system
9:37
specific requirements are always there
9:38
for this it should be like don't show
9:40
repeated people for same user if I have
9:42
already let's say swipe right that is
9:45
okay if I have swiped right someone
9:47
probably that will not come but if let's
9:49
say I have swiped left someone right
9:51
then ideally it should not come back to
9:53
me again right then I would have a bad
9:56
user experience
9:58
or if If you take an example of let's
High-Level Design & Deep Dive
10:00
say some beautiful actress is there and
10:03
then you are showing my profile to her
10:05
every time and then she is swiping me
10:07
left and left so it's a bad experience
10:09
for her right so that is the point of
10:12
this right so this is enough right after
10:14
this you have to come up with a highle
10:16
design so when you were thinking of
10:18
these two right some things should come
10:20
to your mind so let's highlight what of
10:22
the things should come to your mind
10:24
right so this profile should come to
10:26
your mind it should like stay with you
10:28
when you're thinking of this and then
10:30
user should come to your mind and then
10:31
this match should come to your mind and
10:33
then this swipe should come to your mind
10:35
right these are some of the important
10:37
aspects but as the interview will say
10:39
right let's move to the highle design so
10:41
that is what we are also going to do so
10:42
let's move to our highle design don't
10:44
worry about all the components I'll be
10:46
explaining them on the go but let's cur
10:50
go from here right so this is me Jagrit
10:52
on bumble so I am on bumble anyway right
10:55
you can check check out my bumble or
10:57
check out my Instagram Right. So I like
10:59
to connect with new people FYI. So uh so
11:02
this so me I am using the Bumble app
11:04
right. This is the client side of the
11:06
thing right and the UI side of the
11:08
things. And first what I did is I did
11:10
the create profile. So what is going to
11:11
happen in the create profile as this uh
11:14
Bumble has multiple features. It has
11:16
swipe functionality. It has match
11:18
functionality. So lot of things are
11:20
there. So anyway I'm going to go with
11:22
the micros service architecture. Right.
11:24
So that's where we will have the very
11:26
straightforward things. So you have want
11:27
to create a profile. So there will be a
11:29
API gateway. Why API gateway? It's like
11:32
a traffic management system. Just like
11:34
we have for the roads we have a traffic
11:35
control. In the same way when you have
11:38
microervices don't think of these what
11:40
are these these as think of these are
11:42
like some services some servers and each
11:45
server is meant for some X function
11:47
right now API gateway's job is that to
11:50
based on the request right so this would
11:52
be coming from /profile. So from that it
11:55
has to identify which uh micros service
11:58
this has to route to right. So that is
12:00
one of the main function of this. Other
12:02
than that apart from that it can also do
12:05
authentication and also rate limited and
12:07
also one of the things in production
12:09
system is that every request is added a
12:11
request ID so that it is better to track
12:14
the logs and also better to find the
12:16
bugs later in the system. Right? So
12:17
those kind of costs matting things this
12:19
API gateway can do. Right? But the main
12:22
crux is the routing. Now you move to the
12:24
profile right you made this call and
12:26
then here I have uploaded my images and
12:28
also name age my preferences right and
12:31
then it goes through load balancer why
12:33
load balancer because all of these are
12:35
horizontally scalable right these are
12:37
not like this is no there is no not only
12:39
one user service there are multiple user
12:41
services so that's why you need to put a
12:43
load balancer in front of that now so
12:46
you have a user service right uh where
12:49
person is coming and then it's creating
12:51
profile Jagrit is creating uh it's first
12:53
profile and then what is happening after
12:56
that is so you have this uh user DB
12:59
right or you can call this profile also
13:01
it's up to you but why I'm calling this
13:03
user is right because this flow that we
13:06
are talking about uh this flow would be
13:09
there in 90% of the systems this flow
13:12
right so I want to keep things generic
13:15
so that you can correlate this to some
13:17
other function also right so that is the
13:19
first part right so user will come in
13:21
create profile what is happening So I'm
13:23
going to use SQL DB here because each
13:25
user will have similar profile only
13:27
right everyone will have name age ID
13:29
will be there and then age preference
13:31
also gender preference max media
13:33
everyone will have this it's not like a
13:35
product detail which for electronics it
13:38
will vary and the for other it will vary
13:39
so SQL is a safe choice here you can
13:42
argue that you don't need asset
13:43
properties and whatn not so you can go
13:45
with no SQL also that is also a fair
13:47
choice but I would go with SQL DBL so
13:50
that's a simple one so I created my
13:52
profile now I'm looking for matches
13:54
right so what happens next so now based
13:57
on my pre preference the second
13:59
requirement that we discuss here is that
14:01
I should be able to view the stack feed
14:04
right so get the feed or a stack so I'm
14:07
going to call this a stack in this feed
14:09
is generally used in terms of a um used
14:13
in terms of Facebook Instagram that when
14:15
we open that there's a feed of posts
14:18
that come to us but here I'm going to
14:20
use tag just to add a little bit of a
14:22
flavor, right? So this is like a get
14:24
stack API call. This is going to be
14:26
post, this is be post and this is a get
14:29
call, right? So these kind of inter
14:31
these kind of questions can come up but
14:32
these are will be very in the later
14:34
stage. Right? Main crux should be
14:35
handled first. So we have a load
14:37
balancer and then the request goes to
14:39
our stack service. Now what all stack
14:41
service can do right? So basically what
14:43
is the scenario? What is the question
14:45
here? The question here is that Jagrit
14:47
has opened the stack and this Jagrit has
14:49
some preferences right now we need to
14:53
give him some 10 user profiles right or
14:55
some X user profiles who have the
14:58
similar preference for example let's
15:00
take a simple age preference so if I am
15:03
asking for opposite gender people girls
15:05
around uh 15 like 25 to 30 age or 20 to
15:10
30 age then every female gender in this
15:15
20 to 30 age becomes a potential match
15:18
for me because I only have put them age
15:20
as of now. Then I can also gender
15:22
preference also. Then the distance also
15:24
then we will filter them on a distance
15:26
also, right? So let's say if I'm in
15:29
Punjab then somewhere around Punjab,
15:31
right? We will fil Punjab is a very big
15:33
location. You have to come deep down
15:35
into a city level, right? Or a pin code
15:37
level. So that is another filter. But
15:40
other than that you have more filters,
15:41
right? Whether I like coffee, they also
15:43
like coffee. Whether I like Punjabi
15:45
songs, they also like Punjabi songs.
15:47
Right? So those kind of things also will
15:49
come into picture. Right? Now what is
15:51
the naive way of doing this? Naive way
15:52
of doing this is that I can do something
15:54
like this. I can do select star from
15:57
users where anywhere between 18 to 40
16:01
right I can interested in and I can just
16:03
do a search on this table right. I can
16:06
probably call this user service. I have
16:09
kept it kept stack service separate
16:12
because this is going to have some other
16:13
functionalities. Naive way could be that
16:16
okay stack is also going to this and
16:18
this user service is filtering this DB.
16:20
But now the call from stack service will
16:22
be made to this user service to get the
16:24
list of all this. But yes that has
16:26
another concern that you are creating a
16:29
new service itself. So this could stay
16:31
with this also but I I anyway we are not
16:34
going to follow this. This is going to
16:36
do some particular other things also.
16:38
That's why I've kept it separate. So
16:40
what is going to happen in an ideal way
16:42
right or in a better way what I'm going
16:44
to do is right uh whenever a user
16:47
profile is created or is updated we are
16:50
going to put a event into a kafka or
16:52
anywhere but eventually that data is
16:54
going to flow to elastic search right so
16:56
we are going to use something that is
16:58
called elk here right so the data will
17:00
flow to elastic search and then the
17:02
search on this elastic search is fairly
17:05
easy right I can search on based on the
17:07
keyword so the keywords for this would
17:10
find users with the age 18 to 40 because
17:12
this is like a search optimized DB and
17:15
then for this lat and long things
17:17
because these are 2D search there are
17:19
there are other concept like gosh and
17:21
whatn not but again that is not the crux
17:23
of this crux will be in the swipe things
17:25
but for now I'll just abstract that
17:27
logic by saying that okay I'm going to
17:29
use elastic search so the stack service
17:32
is going to query for this stack service
17:35
now what could happen is that Jagrat is
17:37
again coming in he's always on bumble So
17:39
he's he opens the bumble app and then
17:42
sees that okay what are the matches. So
17:44
for based on Jagrit preference we are
17:45
going to call this elastic service and
17:47
show the stack to me right or to Jagrit.
17:51
Now there are a lot of people right it's
17:53
not just I'm not the only one using
17:56
Bumble right let's say some other people
17:58
Ronaldo is also he probably doesn't need
18:00
to be on Bumble but let's say so Neymar
18:02
is on Bumble Neymar is kind of person
18:04
you would find on Bumble right so Neymar
18:06
is on Bumble so um now what would happen
18:09
in that case is that uh like for him or
18:13
for anyone else right this is one way of
18:15
doing that you are doing on demand right
18:18
but another thing that we could do is we
18:19
could premp compute the fields this data
18:22
like user profile is happening on a side
18:25
right it's not like that these both are
18:27
not synchronous rope first the person
18:29
will create the profile so once the
18:31
profile creation is done right what this
18:33
tag service can do is right it can
18:36
premputee the fields so what I mean that
18:39
premputee so this operation where we
18:41
search right so for the particular user
18:43
we would do that offline right even
18:46
whether the user is active or not it
18:48
doesn't matter we will do that and Then
18:50
we would store that in some kind of a
18:52
rad right just a key value pair. So it
18:55
is going to look like this. So key user
18:57
id consider this as my user ID and then
19:00
for me I have I have been showing angel
19:02
priya and princess priya ids right. So
19:04
if now I open my stack and then I am
19:06
going to use see these two profiles.
19:08
Right now TTL is very important here.
19:11
Let's say it should not be like that. If
19:12
I don't have a TTL time to live here
19:14
then I would only be seeing these two
19:16
profiles even if they would have updated
19:18
their profile. Right? So we don't want
19:20
to keep these values for let's say more
19:22
than 60 minutes. 60 minute is ideally
19:24
okay. Uh so that is how I would show. So
19:27
you would have a premputation mix of
19:29
premp computation if I am that. So I
19:31
could just fetch from stack DB to make
19:33
it faster or I could premputee on the
19:36
demand right. So we don't have to run
19:37
this costless query every time. So that
19:40
would be the approach that I would use
19:42
in this. Again guys there could be
19:45
better approaches but this is like one
19:46
way of doing things right. So now uh and
19:49
then stack service is okay right now
19:51
what happens right so okay I've been
19:52
shown a stack of let's say angel priya
19:55
and for some reason I liked angel priya
19:57
and I would like to talk talk to her
19:59
right so what is going to happen now so
20:01
again we will have a swipe so this is
20:03
again going to be a post call so we are
20:05
at this third functionality again Jagrit
20:08
is on bumble so angel Priya's
20:11
profile has been shown to him and he's
20:13
he's interested and he would like to
20:15
swipe right now the swipe is again going
20:18
to go to a swipe service right it's a
20:20
different service
20:24
now what is going to happen in a swipe
20:26
service right so swipe is fairly simple
20:30
like the payload is simple so you have
20:32
user one so user one is here Jagrit and
20:35
then the user two is Priya and I'm
20:37
swiping right right so that's the simple
20:40
way angel Priya not just Priya Angel
20:43
uh now what would happen right it's a
20:46
post called to swipe service. One of the
20:48
important decision here is that which DB
20:50
you are going to use right you could so
20:53
as there would be millions of swipe as
20:55
we discussed right these are there are
20:56
like 100 swipes per user per day right
21:00
and then there are 100 K request and
21:02
daily active users are 100 million so
21:04
100 million and then this 100 into that
21:07
those many number of swipes are there
21:09
because each user is swiping 100 right
21:12
and then there are 100 million daily
21:14
active so that is like 100 into 100
21:16
that's like billion So swipes are there
21:18
in bin. That's a huge data. Right? Now
21:20
we could either go with commar data like
21:22
Cassandra because those are append only.
21:24
So append only means that it is not
21:26
optimized for updates. You are just
21:28
appending the data and then putting into
21:30
a disk. So that would be one choice
21:32
there, right? You go with a Cassandra or
21:34
you go with even no SQL would work fine
21:37
here. But the thing is that you need as
21:39
consistency, right? So that's something
21:42
that you need out of the box. Now here
21:44
two choices are there. But as I would
21:46
like to keep things simple so I'm going
21:48
to go with a Postgress. So this is like
21:50
a relational DB and it comes with asset
21:52
property by default. I'll explain why do
21:54
we need asset properties. Right now
21:56
let's imagine that right now
21:57
simultaneously Angel Priya is also there
22:00
on the Bumble Jagrit is also there on
22:02
the Bumble right now. I swiped Angel
22:05
Priya right at 01 right. Let me just use
22:09
that exped. So I swiped at 01 second
22:13
right. Let's say I swiped this is
22:15
Jagrit, right? And then
22:19
just I'll do a time check. So we are
22:21
right on the time. So and then uh at and
22:24
1 second only
22:27
Angel Priya also did a swipe right.
22:30
Right. So we both did a swipe right. But
22:32
if let's say this was normal DB right in
22:35
this swipe service I would check whether
22:38
so this is like Jagrit
22:40
to angel Priya and this is
22:44
Angel Priya
22:47
right now what would happen is that I am
22:49
going to swipe right angel Priya and
22:51
then when this happened right if we are
22:53
going with eventual consistency I'm
22:56
going to check whether Angel Priya to
22:57
Jagrit is there it is not there right so
23:00
I'm going to say that okay no match And
23:02
then for angel pri again angel pri to j
23:05
both are happening simultaneously for
23:06
this also it is not there right. So just
23:10
imagine that the db state this has is
23:12
also before no match. So like say db
23:17
state they both have this db state right
23:20
db state a. So here db state a goes to
23:23
this and here db state a goes to this
23:25
right. So they both are not aware of
23:28
that each other have matched. So one of
23:29
the fix to this would be that you can
23:31
have a chron job and that checks after
23:34
10 minutes and every time based on that
23:36
you will check that whether if there are
23:38
any missed matches and then you will
23:40
send out the push notification. So this
23:42
is the notification part but here I
23:44
would go with postgr.
23:46
So how I'm going to store the swipe is
23:49
that you have a user A and user B. In
23:51
this case this could be Jagarth Bria but
23:54
I have said that we could just sort them
23:56
by their first name. Right? So user A
23:59
let's say is Angel Priya and then user B
24:01
is Jagrit right? So now what we are
24:03
going to do in this case is when a swipe
24:05
from Jagrit to injury comes right now in
24:08
this case our first user will be Jagrit
24:11
right the person who is doing a swipe
24:13
right now in this case I will mark this
24:16
as true this is marked true right this
24:18
is one row now when Angel Priya wants to
24:21
do the swipe on this right if this my
24:25
operation is already doing so then this
24:27
would be logged right this is a role
24:29
level lock now this This would be this
24:33
angel priya to jag would happen only
24:35
after once this is complete. So in this
24:38
case I would definitely check that okay
24:40
my value is already true and user b's
24:43
also is now becoming true. Right now if
24:45
both of these become true then straight
24:47
away from that only I can send the
24:49
notification. So either if my operation
24:52
got completed first then angel Priya
24:54
would get the notification. If let's say
24:56
her operation had already gotten first I
24:57
would get the notification that okay
24:59
match is found. So that would be the
25:02
check here right that would how the
25:03
operation looks as now using no SQL DB I
25:07
have only I have used the out of the box
25:09
asset property but this is going to be
25:11
expensive here right post greaseole is
25:14
expensive because of these reasons only
25:16
right if not properly managed this is a
25:18
typical deadlock scenario right so um
25:22
then coming to this right and also so
25:24
this would be like how the swipe would
25:26
look like how would you would send the
25:28
notification
25:30
Uh this would be like push notifications
25:31
comes into picture if the user was
25:33
offline. Let's say I was offline. So
25:35
when I will open then I would get a push
25:36
notification on the top. Uh just
25:39
answering the last question right don't
25:41
show the repeat people. So how I am
25:43
think we can tackle that is so you have
25:45
this tag service right. So I can just do
25:48
a check on this swipe service whether
25:50
this particular user in this case Jagrit
25:53
has already swiped or let's say Angel
25:55
Priya has already swiped no to Jagrit
25:58
right? So I can just do a check here and
25:59
then filter the stack based on that. So
26:02
this stack in this let's say Angel Pri
26:04
has already put me swiped left right
26:06
then there is no point of me or if I
26:08
have already swiped left Angel Priya
26:10
there is you should remove this from
26:12
that stack right. Uh so that's pretty
26:14
much about Bumble. It's like 25 minutes
26:17
but 5 minutes I was talking about these
26:19
random stuff. If you um think of this
26:22
bumble, I think we were pretty much on
26:24
time. But so this is the design how I
26:27
would like to design Bumble. Feel free
26:29
to let me know in chat what do you
26:31
think? What do you think is a bottleneck
26:33
of the system but in ideally interview
26:35
setting this would be a fairly okay um
26:38
design at a mid-level candidate right I
26:41
think 3 to 5 years of experience. So,
26:43
but again as I mentioned these are like
26:45
short videos right short click to revise
26:48
and then click to know if you're curious
26:49
just like Netflix short series but if
26:52
you want to learn more about the things
26:54
this this is a link I'll attach this
26:56
link in the chat also so these are all
26:58
the resources that I have personally
27:00
used gawking system design is really
27:02
good karamatabs is really good hello
27:04
interview is really good system design
27:06
book is also really good right and also
27:08
data incentive book is also really good
27:11
so with that That's it. Thank you guys.
27:13
Have a nice day. Bye.
