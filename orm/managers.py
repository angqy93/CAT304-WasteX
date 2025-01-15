from django.db import models
from django.utils import timezone

class UserManager(models.Manager):

    def get_user(self, id):
        return self.filter(id=id).first()

    def get_all_users(self):
        return self.all()

