const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let idForTest;

suite('Functional Tests', function() {
  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .post('/api/issues/maggi')
        .send({
          issue_title: "Maggi",
          issue_text: "woof woof",
          created_by: "Pipo",
          assigned_to: "Maggi",
          status_text: "testing"
        })
        .end(function (err, res) {      
          assert.equal(res.status, 200);
          assert.isDefined(res.body._id);
          assert.equal(res.body.issue_title, 'Maggi');
          assert.equal(res.body.issue_text, 'woof woof');
          assert.isDefined(res.body.created_on);
          assert.isDefined(res.body.updated_on);
          assert.equal(res.body.created_by, 'Pipo');
          assert.equal(res.body.assigned_to, 'Maggi');
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, 'testing');
          idForTest = res.body._id
          done();
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/maggi')
      .send({
        issue_title: "Maggi",
        issue_text: "woof woof",
        created_by: "Pipo"
      })
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.isDefined(res.body._id);
        assert.equal(res.body.issue_title, 'Maggi');
        assert.equal(res.body.issue_text, 'woof woof');
        assert.isDefined(res.body.created_on);
        assert.isDefined(res.body.updated_on);
        assert.equal(res.body.created_by, 'Pipo');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.open, true);
        assert.equal(res.body.status_text, '');
        done();
    });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/maggi')
      .send({
        assigned_to: "Maggi",
        status_text: "testing"
      })
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.text, '{"error":"required field(s) missing"}');
        done();
    });
  });

  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/maggi')
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.isArray(res.body);
        assert.property(res.body[0], '_id');
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], 'status_text');
        done();
    });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/maggi?issue_title=Test')
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.isArray(res.body);
        assert.property(res.body[0], '_id');
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], 'status_text');
        assert.equal(res.body[0].issue_title, 'Test');
        done();
    });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/maggi?issue_title=Test&created_by=Maggi&status_text=Yummy')
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.isArray(res.body);
        assert.property(res.body[0], '_id');
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], 'status_text');
        assert.equal(res.body[0].issue_title, 'Test');
        assert.equal(res.body[0].created_by, 'Maggi');
        assert.equal(res.body[0].status_text, 'Yummy');
        done();
    });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/maggi')
      .send({
        _id: idForTest,
        issue_title: 'Food!!!'
      })
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.body._id, idForTest);
        assert.equal(res.type, 'application/json');
        assert.equal(res.text, '{"result":"successfully updated","_id":"'+idForTest+'"}');
        chai
          .request(server)
          .get('/api/issues/maggi?_id=' + idForTest)
          .end(function (err, res) {      
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isArray(res.body);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.equal(res.body[0].issue_title, 'Food!!!');
            done();
        });
    });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/maggi')
      .send({
        _id: '6345164de86eaff438e89b4c',
        issue_title: 'Fun!!!',
        issue_text: 'yayayay!'
      })
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.body._id, '6345164de86eaff438e89b4c');
        assert.equal(res.type, 'application/json');
        assert.equal(res.text, '{"result":"successfully updated","_id":"6345164de86eaff438e89b4c"}');
        chai
          .request(server)
          .get('/api/issues/maggi?_id=6345164de86eaff438e89b4c')
          .end(function (err, res) {      
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isArray(res.body);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.equal(res.body[0].issue_title, 'Fun!!!');
            assert.equal(res.body[0].issue_text, 'yayayay!');
            done();
        });
    });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/maggi')
      .send({
        issue_title: 'Food!!!'
      })
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.text, '{"error":"missing _id"}');
        done();
    });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/maggi')
      .send({
        _id: '6345165e69e94aa9190d0c4f'
      })
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.text, '{"error":"no update field(s) sent","_id":"6345165e69e94aa9190d0c4f"}');
        done();
    });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/maggi')
      .send({
        _id: '999'
      })
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.text, '{"error":"could not update","_id":"999"}');
        done();
    });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/maggi')
      .send({
        _id: idForTest,
      })
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.text, '{"result":"successfully deleted","_id":"'+idForTest+'"}');
        done();
    });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/maggi')
      .send({
        _id: '888',
      })
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.text, '{"error":"could not delete","_id":"888"}');
        done();
    });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/maggi')
      .end(function (err, res) {      
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.text, '{"error":"missing _id"}');
        done();
    });
  });
});