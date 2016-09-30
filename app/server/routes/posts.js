
module.exports = function(app, db) {

    app.get('/posts/user', function(req, res) {
        db.getUserGuid()
        .then(function(guid) {
            console.log(guid)
            db.getPost(guid.value)
            .then(function(posts) {
                posts = posts.rows.map(function(val){
                    return val.doc;
                });
                console.log(posts);
                res.json(posts);
            }).catch(function(err) {
                console.log(err);
                res.status(404).send(err);
            });
        });



    });

    app.get('/posts/list', function(req, res) {
        db.getPost()
        .then(function(posts) {
            posts = posts.rows.map(function(val){
                    return val.doc;
                });
            res.json(posts);
        }).catch(function(err) {
            res.status(404).send(err);
        });
    });


    // create todo and send back all todos after creation
    app.post('/posts/save', function(req, res) {
        console.log(req.body);
        var new_post = req.body;
        
        db.putPost({
            text: new_post.text,
            info: new_post.info,
            to_delete: false
        }).then(function(posts) {
            res.json(posts);
        }).catch(function(err) {
            res.status(404).send(err);
        });

    });

    app.delete('/posts/user/:post_id', function(req, res) {
        Content.remove({
            _id: req.params.post_id
        }, function(err, post) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            Content.find({
                type: "post"
            }, function(err, posts) {
                if (err)
                    res.send(err)
                res.json(posts);
            });
        });
    });

}