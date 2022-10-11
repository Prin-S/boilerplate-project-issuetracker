'use strict';

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let issueSchema = new mongoose.Schema({
  project_name: String,
  issue: [{
    issue_title: {
      type: String,
      required: true
    },
    issue_text: {
      type: String,
      required: true
    },
    created_on: {
      type: Date,
      default: new Date().toISOString()
    },
    updated_on: {
      type: Date,
      default: new Date().toISOString()
    },
    created_by: {
      type: String,
      required: true
    },
    assigned_to: {
      type: String,
      default: ""
    },
    open: {
      type: Boolean,
      default: true
    },
    status_text: {
      type: String,
      default: ""
    }
  }]
})

let Issue = mongoose.model("Issue", issueSchema);

// For clearing the database
/*Issue.remove((err) => {
  console.log( "Database cleared" );
});*/

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let _id = req.query._id;
      let issue_title = req.query.issue_title;
      let issue_text = req.query.issue_text;
      let created_on = req.query.created_on;
      let updated_on = req.query.updated_on;
      let created_by = req.query.created_by;
      let assigned_to = req.query.assigned_to;
      let open = req.query.open;
      let status_text = req.query.status_text;

      // Find project
      Issue.find({project_name: project}, (err, data) => {
        if (err) {
          console.log(err);
        } else if (data[0] === undefined) {
          // If project has no issues
          res.json(data);
        } else {
          // Show just the 'issue' array of objects
          let result = data[0].issue;
          
          // Conditionals for when queries are included
          if (_id) {
            result = data[0].issue.filter(each => each._id == _id);
          }
    
          if (issue_title) {
            result = data[0].issue.filter(each => each.issue_title == issue_title);
          }
    
          if (issue_text) {
            result = data[0].issue.filter(each => each.issue_text == issue_text);
          }
    
          if (created_on) {
            result = data[0].issue.filter(each => each.created_on == created_on);
          }
    
          if (updated_on) {
            result = data[0].issue.filter(each => each.updated_on == updated_on);
          }
    
          if (created_by) {
            result = data[0].issue.filter(each => each.created_by == created_by);
          }
    
          if (assigned_to) {
            result = data[0].issue.filter(each => each.assigned_to == assigned_to);
          }
    
          if (open) {
            result = data[0].issue.filter(each => each.open == open);
          }
    
          if (status_text) {
            result = data[0].issue.filter(each => each.status_text == status_text);
          }

          res.json(result);
        }
      })
    })

    .post(function (req, res){
      let project = req.params.project;
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let assigned_to = req.body.assigned_to;
      let status_text = req.body.status_text;

      // Find project
      Issue.find({project_name: project}, (err, data) => {
        if (err) {
          console.log(err);
        } else if (!issue_title || !issue_text || !created_by) {
          // If any required field is missing
          res.json({error: 'required field(s) missing'});
        } else {
          // If project is not found
          if (data[0] === undefined) {
            // Create new project
            Issue.create({project_name: project}, (err, data) => {
              if (err) {
                console.log(err);
              } else {
                // Find project again as it has just been added
                Issue.find({project_name: project}, (err, data) => {
                  if (err) {
                    console.log(err);
                  } else {
                    // Show project details
                    let _id = data[0]._id;

                    Issue.findByIdAndUpdate(_id, {$push: {issue: {issue_title, issue_text, created_by, assigned_to, status_text}}}, {new: true}, (err, data) => {
                      if (err) {
                        console.log(err);
                      } else {
                        let latestIssue = data.issue[data.issue.length - 1]; // Find the newest issue details
                        res.json(latestIssue);
                      }
                    });
                  }
                });
              }
            });
          } else {
            // If project is found, just show project details
            let _id = data[0]._id;

            Issue.findByIdAndUpdate(_id, {$push: {issue: {issue_title, issue_text, created_by, assigned_to, status_text}}}, {new: true}, (err, data) => {
              if (err) {
                console.log(err);
              } else {
                let latestIssue = data.issue[data.issue.length - 1]; // Find the newest issue details
                res.json(latestIssue);
              }
            });
          }
        }
      });
    })
    
    .put(function (req, res){
      let _id = req.body._id;
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let assigned_to = req.body.assigned_to;
      let open = req.body.open;
      let status_text = req.body.status_text;

      // If '_id' is missing
      if (!_id) {
        res.json({error: 'missing _id'});
      } else {
        // Find issue according to '_id'
        Issue.find({'issue._id': _id}, (err, data) => {
          if (err) {
            // If an invalid '_id' is entered
            res.json({error: 'could not update', _id});
          } else if (!issue_title && !issue_text && !created_by && !assigned_to && !open && !status_text) {
            // If all fields (other than '_id') are missing
            res.json({error: 'no update field(s) sent', _id});
          } else if (data.length == 0) {
            // Sometimes an empty array is returned when an invalid '_id' is entered
            res.json({error: 'could not update', _id});
          } else {
            // Variable to set fields to update (default includes current time for 'updated_on')
            let toUpdate = {'issue.$.updated_on': new Date().toISOString()};

            // Conditionals for when fields to update are entered
            if (issue_title) {
              toUpdate['issue.$.issue_title'] = issue_title;
            }

            if (issue_text) {
              toUpdate['issue.$.issue_text'] = issue_text;
            }

            if (created_by) {
              toUpdate['issue.$.created_by'] = created_by;
            }

            if (assigned_to) {
              toUpdate['issue.$.assigned_to'] = assigned_to;
            }

            if (open) {
              toUpdate['issue.$.open'] = open;
            }

            if (status_text) {
              toUpdate['issue.$.status_text'] = status_text;
            }

            // Find issue and update according to entered fields
            Issue.findOneAndUpdate({'issue._id': _id}, {$set: toUpdate}, (err, data) => {
              if (err) {
                res.json({error: 'could not update', _id});
              } else {
                res.json({result: 'successfully updated', _id});
              }
            });
          }
        })
      }
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let _id = req.body._id;
      
      // If '_id' is missing
      if (!_id) {
        res.json({error: 'missing _id'});
      } else {
        // Find issue according to '_id'
        Issue.find({'issue._id': _id}, (err, data) => {
          if (err) {
            // If an invalid '_id' is entered
            res.json({error: 'could not delete', _id});
          } else if (data.length == 0) {
            // Sometimes an empty array is returned when an invalid '_id' is entered
            res.json({error: 'could not delete', _id});
          } else {
            // Find project and delete issue according to '_id'
            Issue.findOneAndUpdate({project_name: project}, {$pull: {issue: {_id: _id}}}, {new: true}, (err, data) => {
              if (err) {
                res.json({error: 'could not delete', _id});
              } else {
                res.json({result: 'successfully deleted', _id});
              }
            });
          }
        })
      }
    });

};
